import type Stripe from 'stripe';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

interface ParsedInvoiceLine {
  id: string;
  paymentProviderId: string;
  invoiceId: string;
  customerId: string;
  invoiceStatus: string;
  invoicePeriodEnd: Date;
  usageType: 'licensed' | 'metered' | 'one_time';
  amountCents: number;
  periodStart: Date;
  periodEnd: Date;
  periodMonths: number;
  mrrCents: number;
}

function parseInvoiceLines(
  invoices: Stripe.Invoice[],
  paymentProviderId: string,
): ParsedInvoiceLine[] {
  const lines: ParsedInvoiceLine[] = [];

  for (const invoice of invoices) {
    const customerId = invoice.customer as string;
    const invoiceStatus = invoice.status ?? 'unknown';
    const invoicePeriodEnd = new Date(invoice.period_end * 1000);

    for (const line of (invoice.lines as any).data) {
      const usageType = line.pricing?.price_details?.price?.recurring?.usage_type;
      const lineType: ParsedInvoiceLine['usageType'] | null =
        usageType === 'licensed'
          ? 'licensed'
          : usageType === 'metered'
            ? 'metered'
            : usageType == null && line.amount != null
              ? 'one_time'
              : null;

      if (!lineType) continue;

      const periodMonths = Math.max(
        1,
        Math.round((line.period.end - line.period.start) / (86400 * 30.44)),
      );

      lines.push({
        id: line.id,
        paymentProviderId,
        invoiceId: invoice.id,
        customerId,
        invoiceStatus,
        invoicePeriodEnd,
        usageType: lineType,
        amountCents: line.amount,
        periodStart: new Date(line.period.start * 1000),
        periodEnd: new Date(line.period.end * 1000),
        periodMonths,
        mrrCents: Math.round(line.amount / periodMonths),
      });
    }
  }

  return lines;
}

// Upsert a batch of invoice line items into payment_provider_invoice.
export async function upsertInvoiceBatch(
  invoices: Stripe.Invoice[],
  paymentProviderId: string,
): Promise<void> {
  return runQuery({
    [PRISMA]: () => relationalQuery(invoices, paymentProviderId),
    [CLICKHOUSE]: () => clickhouseQuery(invoices, paymentProviderId),
  });
}

async function relationalQuery(
  invoices: Stripe.Invoice[],
  paymentProviderId: string,
): Promise<void> {
  const db = prisma.client as any;
  const lines = parseInvoiceLines(invoices, paymentProviderId);

  for (const line of lines) {
    await db.paymentProviderInvoice.upsert({
      where: { id: line.id },
      create: {
        id: line.id,
        paymentProviderId: line.paymentProviderId,
        invoiceId: line.invoiceId,
        customerId: line.customerId,
        invoiceStatus: line.invoiceStatus,
        invoicePeriodEnd: line.invoicePeriodEnd,
        usageType: line.usageType,
        amountCents: line.amountCents,
        periodStart: line.periodStart,
        periodEnd: line.periodEnd,
        periodMonths: line.periodMonths,
        mrrCents: line.mrrCents,
      },
      update: {
        invoiceStatus: line.invoiceStatus,
        invoicePeriodEnd: line.invoicePeriodEnd,
        amountCents: line.amountCents,
        usageType: line.usageType,
        mrrCents: line.mrrCents,
      },
    });
  }
}

// ReplacingMergeTree dedupes on (payment_provider_id, line_id), keeping the
// most recently inserted row — so a batch insert of the current line state
// is all an "upsert" needs, no update statement required.
async function clickhouseQuery(
  invoices: Stripe.Invoice[],
  paymentProviderId: string,
): Promise<void> {
  const { insert, getUTCString } = clickhouse;
  const lines = parseInvoiceLines(invoices, paymentProviderId);

  if (!lines.length) return;

  const rows = lines.map(line => ({
    line_id: line.id,
    payment_provider_id: line.paymentProviderId,
    invoice_id: line.invoiceId,
    customer_id: line.customerId,
    invoice_status: line.invoiceStatus,
    invoice_period_end: getUTCString(line.invoicePeriodEnd),
    usage_type: line.usageType,
    amount_cents: line.amountCents,
    period_start: getUTCString(line.periodStart),
    period_end: getUTCString(line.periodEnd),
    period_months: line.periodMonths,
    mrr_cents: line.mrrCents,
    created_at: getUTCString(new Date()),
  }));

  await insert('payment_provider_invoice', rows);
}
