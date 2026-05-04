import { decrypt, secret } from '@/lib/crypto';
import { fetchInvoicePageBackfill, fetchInvoicePageIncremental } from '@/lib/stripe';
import { getBillingById, updateBillingSync } from '@/queries/prisma';
import { STALE_RUNNING_MS, upsertInvoiceBatch } from '@/queries/prisma/billingInvoice';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ billingId: string }> },
) {
  const { billingId } = await params;
  const { mode: rawMode } = await request.json();
  const mode = rawMode === 'full' ? 'full' : 'batch';

  const keyRow = await getBillingById(billingId);

  if (!keyRow) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  // Concurrency guard
  if (
    keyRow.syncStatus === 'running' &&
    keyRow.updatedAt > new Date(Date.now() - STALE_RUNNING_MS)
  ) {
    return NextResponse.json({ skipped: true, reason: 'already running' }, { status: 409 });
  }

  await updateBillingSync(billingId, { syncStatus: 'running' });

  // Decrypt the API key and create a scoped Stripe client
  const rawApiKey = decrypt(keyRow.apiKey, secret());
  const stripe = new Stripe(rawApiKey, { apiVersion: '2026-02-25.clover' });

  try {
    const isBackfilling = keyRow.syncStatus !== 'idle' || keyRow.syncCursor != null;
    let processed = 0;
    let lastCursor: string | null = keyRow.syncCursor ?? null;

    if (mode === 'full') {
      let hasMore = true;
      while (hasMore) {
        const page = isBackfilling
          ? await fetchInvoicePageBackfill(stripe, lastCursor)
          : await fetchInvoicePageIncremental(stripe);

        await upsertInvoiceBatch(page.data, billingId);

        processed += page.data.length;
        hasMore = page.has_more;
        lastCursor = page.data.length > 0 ? page.data[page.data.length - 1].id : lastCursor;

        if (!isBackfilling) break;
      }

      await updateBillingSync(billingId, {
        syncStatus: 'idle',
        syncCursor: null,
        lastRunAt: new Date(),
      });

      return NextResponse.json({ processed, hasMore: false, cursor: null, status: 'idle' });
    } else {
      const page = isBackfilling
        ? await fetchInvoicePageBackfill(stripe, lastCursor)
        : await fetchInvoicePageIncremental(stripe);

      await upsertInvoiceBatch(page.data, billingId);

      const nextCursor =
        page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : null;
      const nextStatus = page.has_more ? 'backfilling' : 'idle';

      await updateBillingSync(billingId, {
        syncStatus: nextStatus,
        syncCursor: nextCursor,
        ...(nextStatus === 'idle' && { lastRunAt: new Date() }),
      });

      return NextResponse.json({
        processed: page.data.length,
        hasMore: page.has_more,
        cursor: nextCursor,
        status: nextStatus,
      });
    }
  } catch (err) {
    await updateBillingSync(billingId, { syncStatus: 'idle' });
    throw err;
  }
}
