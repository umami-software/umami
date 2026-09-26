import Stripe from 'stripe';
import { decrypt, secret } from '@/lib/crypto';
import { getPaymentProviderById, updatePaymentProviderSync } from '@/queries/prisma';
import { STALE_RUNNING_MS } from '@/queries/prisma/paymentProviderInvoice';
import { upsertInvoiceBatch } from '@/queries/sql';

const INVOICE_EXPAND = ['data.lines.data.pricing.price_details.price'];

function startOfCurrentMonth(): number {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

// Fetch one page of invoices oldest-first for backfill. Pass null cursor to start from the beginning.
async function fetchInvoicePageBackfill(
  client: Stripe,
  cursor: string | null,
): Promise<Awaited<ReturnType<typeof client.invoices.list>>> {
  return client.invoices.list({
    limit: 100,
    expand: INVOICE_EXPAND,
    created: { lte: Math.floor(Date.now() / 1000) },
    ...(cursor ? { starting_after: cursor } : {}),
  });
}

// Fetch one page of invoices created in the current calendar month (incremental refresh).
async function fetchInvoicePageIncremental(
  client: Stripe,
): Promise<Awaited<ReturnType<typeof client.invoices.list>>> {
  return client.invoices.list({
    limit: 100,
    expand: INVOICE_EXPAND,
    created: { gte: startOfCurrentMonth() },
  });
}

export type SyncMode = 'batch' | 'full';

export interface SyncResult {
  processed: number;
  hasMore: boolean;
  cursor: string | null;
  status: string;
}

export interface SyncPageInfo {
  paymentProviderId: string;
  pageProcessed: number;
  totalProcessed: number;
  cursor: string | null;
  hasMore: boolean;
}

export interface SyncOptions {
  onPage?: (info: SyncPageInfo) => void;
}

export class PaymentProviderNotFoundError extends Error {}
export class PaymentProviderSyncAlreadyRunningError extends Error {}

// Syncs one page (mode: 'batch') or all pages (mode: 'full') of Stripe invoices
// for a single payment provider. Safe to call repeatedly — progress is tracked
// via syncCursor/syncStatus on the payment provider row, so a 'batch' call always picks
// up where the last one left off.
export async function syncPaymentProviderInvoices(
  paymentProviderId: string,
  mode: SyncMode = 'batch',
  options?: SyncOptions,
): Promise<SyncResult> {
  const keyRow = await getPaymentProviderById(paymentProviderId);

  if (!keyRow) {
    throw new PaymentProviderNotFoundError(`Payment provider not found: ${paymentProviderId}`);
  }

  if (
    keyRow.syncStatus === 'running' &&
    keyRow.updatedAt > new Date(Date.now() - STALE_RUNNING_MS)
  ) {
    throw new PaymentProviderSyncAlreadyRunningError(
      `Payment provider sync already running: ${paymentProviderId}`,
    );
  }

  await updatePaymentProviderSync(paymentProviderId, { syncStatus: 'running' });

  const rawApiKey = decrypt(keyRow.apiKey, secret());
  const stripe = new Stripe(rawApiKey, { apiVersion: '2026-02-25.clover' });

  try {
    const isBackfilling =
      keyRow.syncStatus !== 'idle' || keyRow.syncCursor != null || keyRow.lastRunAt == null;
    let processed = 0;
    let lastCursor: string | null = keyRow.syncCursor ?? null;

    if (mode === 'full') {
      let hasMore = true;
      while (hasMore) {
        const page = isBackfilling
          ? await fetchInvoicePageBackfill(stripe, lastCursor)
          : await fetchInvoicePageIncremental(stripe);

        await upsertInvoiceBatch(page.data, paymentProviderId);

        processed += page.data.length;
        hasMore = page.has_more;
        lastCursor = page.data.length > 0 ? page.data[page.data.length - 1].id : lastCursor;

        options?.onPage?.({
          paymentProviderId,
          pageProcessed: page.data.length,
          totalProcessed: processed,
          cursor: lastCursor,
          hasMore,
        });

        if (!isBackfilling) break;
      }

      await updatePaymentProviderSync(paymentProviderId, {
        syncStatus: 'idle',
        syncCursor: null,
        lastRunAt: new Date(),
      });

      return { processed, hasMore: false, cursor: null, status: 'idle' };
    }

    const page = isBackfilling
      ? await fetchInvoicePageBackfill(stripe, lastCursor)
      : await fetchInvoicePageIncremental(stripe);

    await upsertInvoiceBatch(page.data, paymentProviderId);

    const nextCursor =
      page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : null;
    const nextStatus = page.has_more ? 'backfilling' : 'idle';

    await updatePaymentProviderSync(paymentProviderId, {
      syncStatus: nextStatus,
      syncCursor: nextCursor,
      ...(nextStatus === 'idle' && { lastRunAt: new Date() }),
    });

    options?.onPage?.({
      paymentProviderId,
      pageProcessed: page.data.length,
      totalProcessed: page.data.length,
      cursor: nextCursor,
      hasMore: page.has_more,
    });

    return {
      processed: page.data.length,
      hasMore: page.has_more,
      cursor: nextCursor,
      status: nextStatus,
    };
  } catch (err) {
    await updatePaymentProviderSync(paymentProviderId, { syncStatus: 'idle' });
    throw err;
  }
}
