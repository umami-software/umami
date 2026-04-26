import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { decrypt, secret } from '@/lib/crypto';
import { fetchInvoicePageBackfill, fetchInvoicePageIncremental } from '@/lib/stripe';
import { getBillingProviderById, updateBillingProviderSync } from '@/queries/prisma';
import { STALE_RUNNING_MS, upsertInvoiceBatch } from '@/queries/prisma/billing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // keyId identifies which BillingProvider (i.e. which owner) to sync.
  // mode=full  — fetch all pages in one request (self-hosted, no timeout concern)
  // mode=batch — fetch one page and return; caller re-invokes (Vercel / default)
  const keyId = searchParams.get('keyId');
  const mode = searchParams.get('mode') === 'full' ? 'full' : 'batch';

  if (!keyId) {
    return NextResponse.json({ error: 'keyId is required' }, { status: 400 });
  }

  const keyRow = await getBillingProviderById(keyId);
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

  await updateBillingProviderSync(keyId, { syncStatus: 'running' });

  // Decrypt the API key and create a scoped Stripe client
  const rawApiKey = decrypt(keyRow.apiKey, secret());
  const stripe = new Stripe(rawApiKey, { apiVersion: '2026-02-25.clover' });

  try {
    const isBackfilling = keyRow.syncStatus !== 'idle' || keyRow.syncCursor != null;
    let processed = 0;
    let lastCursor: string | null = keyRow.syncCursor ?? null;

    // If backfilling, always fetch in batch mode to avoid partial syncs. Otherwise, follow the requested mode.
    if (mode === 'full') {
      let hasMore = true;
      while (hasMore) {
        const page = isBackfilling
          ? await fetchInvoicePageBackfill(stripe, lastCursor)
          : await fetchInvoicePageIncremental(stripe);

        await upsertInvoiceBatch(page.data, keyId);

        processed += page.data.length;
        hasMore = page.has_more;
        lastCursor = page.data.length > 0 ? page.data[page.data.length - 1].id : lastCursor;

        if (!isBackfilling) break;
      }

      await updateBillingProviderSync(keyId, { syncStatus: 'idle', syncCursor: null });

      return NextResponse.json({ processed, hasMore: false, cursor: null, status: 'idle' });
    } else {
      const page = isBackfilling
        ? await fetchInvoicePageBackfill(stripe, lastCursor)
        : await fetchInvoicePageIncremental(stripe);

      await upsertInvoiceBatch(page.data, keyId);

      const nextCursor =
        page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : null;
      const nextStatus = page.has_more ? 'backfilling' : 'idle';

      await updateBillingProviderSync(keyId, { syncStatus: nextStatus, syncCursor: nextCursor });

      return NextResponse.json({
        processed: page.data.length,
        hasMore: page.has_more,
        cursor: nextCursor,
        status: nextStatus,
      });
    }
  } catch (err) {
    await updateBillingProviderSync(keyId, { syncStatus: 'idle' });
    throw err;
  }
}
