#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Umami Payment Provider Invoice Sync
 *
 * Backfills/refreshes Stripe invoice data for payment providers. Runs as a
 * standalone process so it isn't bound by serverless function time limits.
 *
 * Usage:
 *   npm run sync-payment-provider                              # Sync every payment provider
 *   npm run sync-payment-provider -- --paymentProviderId <id>   # Sync a single payment provider
 */

import 'dotenv/config';
import {
  PaymentProviderNotFoundError,
  PaymentProviderSyncAlreadyRunningError,
  type SyncPageInfo,
  syncPaymentProviderInvoices,
} from '@/lib/paymentProvider';
import prisma from '@/lib/prisma';
import { getPaymentProviderSyncStatuses } from '@/queries/prisma';

interface CliArgs {
  paymentProviderId?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const config: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--paymentProviderId' && args[i + 1]) {
      config.paymentProviderId = args[i + 1];
      i++;
    } else if (arg.startsWith('--paymentProviderId=')) {
      config.paymentProviderId = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp(): void {
  console.log(`
Umami Payment Provider Invoice Sync

Backfills/refreshes Stripe invoice data for payment providers.

Usage:
  npm run sync-payment-provider [options]

Options:
  --paymentProviderId <id>   Sync only this payment provider (default: sync all)
  --help, -h                 Show this help message

Examples:
  npm run sync-payment-provider
  npm run sync-payment-provider -- --paymentProviderId 123e4567-e89b-12d3-a456-426614174000
`);
}

function onPage(info: SyncPageInfo): void {
  console.log(
    `  [${info.paymentProviderId}] +${info.pageProcessed} invoices (total ${info.totalProcessed}, cursor ${info.cursor ?? 'null'}, hasMore ${info.hasMore})`,
  );
}

async function syncOne(paymentProviderId: string): Promise<'succeeded' | 'skipped' | 'failed'> {
  try {
    const result = await syncPaymentProviderInvoices(paymentProviderId, 'full', { onPage });
    console.log(
      `[${paymentProviderId}] done — processed ${result.processed}, status ${result.status}`,
    );
    return 'succeeded';
  } catch (err) {
    if (err instanceof PaymentProviderNotFoundError) {
      console.warn(`[${paymentProviderId}] skipped — not found`);
      return 'skipped';
    }
    if (err instanceof PaymentProviderSyncAlreadyRunningError) {
      console.warn(`[${paymentProviderId}] skipped — already running`);
      return 'skipped';
    }
    console.error(`[${paymentProviderId}] failed —`, err);
    return 'failed';
  }
}

async function main(): Promise<void> {
  const { paymentProviderId } = parseArgs();

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  if (paymentProviderId) {
    const outcome = await syncOne(paymentProviderId);
    if (outcome === 'succeeded') succeeded++;
    else if (outcome === 'skipped') skipped++;
    else failed++;
  } else {
    const rows = await getPaymentProviderSyncStatuses();
    console.log(`Syncing ${rows.length} payment provider(s)...`);

    for (const row of rows) {
      const outcome = await syncOne(row.id);
      if (outcome === 'succeeded') succeeded++;
      else if (outcome === 'skipped') skipped++;
      else failed++;
    }
  }

  console.log(`\n${succeeded} succeeded, ${skipped} skipped, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.client.$disconnect();
  });
