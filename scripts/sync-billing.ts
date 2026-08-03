#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Umami Billing Invoice Sync
 *
 * Backfills/refreshes Stripe invoice data for billing providers. Runs as a
 * standalone process so it isn't bound by serverless function time limits.
 *
 * Usage:
 *   npm run sync-billing                        # Sync every billing provider
 *   npm run sync-billing -- --billingId <id>     # Sync a single billing provider
 */

import 'dotenv/config';
import {
  BillingNotFoundError,
  BillingSyncAlreadyRunningError,
  type SyncPageInfo,
  syncBillingInvoices,
} from '@/lib/billing';
import prisma from '@/lib/prisma';
import { getBillingSyncStatuses } from '@/queries/prisma';

interface CliArgs {
  billingId?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const config: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--billingId' && args[i + 1]) {
      config.billingId = args[i + 1];
      i++;
    } else if (arg.startsWith('--billingId=')) {
      config.billingId = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp(): void {
  console.log(`
Umami Billing Invoice Sync

Backfills/refreshes Stripe invoice data for billing providers.

Usage:
  npm run sync-billing [options]

Options:
  --billingId <id>   Sync only this billing provider (default: sync all)
  --help, -h         Show this help message

Examples:
  npm run sync-billing
  npm run sync-billing -- --billingId 123e4567-e89b-12d3-a456-426614174000
`);
}

function onPage(info: SyncPageInfo): void {
  console.log(
    `  [${info.billingId}] +${info.pageProcessed} invoices (total ${info.totalProcessed}, cursor ${info.cursor ?? 'null'}, hasMore ${info.hasMore})`,
  );
}

async function syncOne(billingId: string): Promise<'succeeded' | 'skipped' | 'failed'> {
  try {
    const result = await syncBillingInvoices(billingId, 'full', { onPage });
    console.log(`[${billingId}] done — processed ${result.processed}, status ${result.status}`);
    return 'succeeded';
  } catch (err) {
    if (err instanceof BillingNotFoundError) {
      console.warn(`[${billingId}] skipped — not found`);
      return 'skipped';
    }
    if (err instanceof BillingSyncAlreadyRunningError) {
      console.warn(`[${billingId}] skipped — already running`);
      return 'skipped';
    }
    console.error(`[${billingId}] failed —`, err);
    return 'failed';
  }
}

async function main(): Promise<void> {
  const { billingId } = parseArgs();

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  if (billingId) {
    const outcome = await syncOne(billingId);
    if (outcome === 'succeeded') succeeded++;
    else if (outcome === 'skipped') skipped++;
    else failed++;
  } else {
    const rows = await getBillingSyncStatuses();
    console.log(`Syncing ${rows.length} billing provider(s)...`);

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
