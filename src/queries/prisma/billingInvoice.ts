import type Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const STALE_RUNNING_MS = 2 * 60 * 1000;

// Upsert a batch of invoice line items into billing_invoice.
export async function upsertInvoiceBatch(
  invoices: Stripe.Invoice[],
  providerId: string,
): Promise<void> {
  const db = prisma.client as any;

  for (const invoice of invoices) {
    const customerId = invoice.customer as string;
    const invoiceStatus = invoice.status ?? 'unknown';
    const invoicePeriodEnd = new Date(invoice.period_end * 1000);

    for (const line of (invoice.lines as any).data) {
      const usageType = line.pricing?.price_details?.price?.recurring?.usage_type;
      const lineType: string | null =
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

      await db.billingInvoice.upsert({
        where: { id: line.id },
        create: {
          id: line.id,
          providerId,
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
        },
        update: {
          invoiceStatus,
          invoicePeriodEnd,
          amountCents: line.amount,
          usageType: lineType,
          mrrCents: Math.round(line.amount / periodMonths),
        },
      });
    }
  }
}
