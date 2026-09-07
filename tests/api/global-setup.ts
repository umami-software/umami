/* eslint-disable no-console */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { type FullConfig, request } from '@playwright/test';
import { ApiClient } from './client';
import { disableCoverageRecording } from './coverage/recorder';
import { COVERAGE_DIR, SEED_FILE } from './paths';
import { seedEnvironment } from './seed/setup';

const HEARTBEAT_TIMEOUT_MS = 120_000;

async function waitForHeartbeat(baseURL: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  let lastError = '';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/api/heartbeat`);

      if (response.ok) {
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = (error as Error).message;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Timed out waiting for ${baseURL}/api/heartbeat (${lastError}). ` +
      'Start the stack with `pnpm test:api:up` or run the full flow with `pnpm test:api`.',
  );
}

export default async function globalSetup(config: FullConfig) {
  // Seeding traffic must not count towards endpoint coverage.
  disableCoverageRecording();

  const baseURL = config.projects[0]?.use?.baseURL;

  if (!baseURL) {
    throw new Error('playwright.api.config.ts must define use.baseURL');
  }

  // API_SKIP_SEED=1 reuses the seed from a previous run against a kept stack
  // (fast iteration on a single spec).
  const skipSeed = !!process.env.API_SKIP_SEED && existsSync(SEED_FILE);

  // Coverage must reflect this run only: the per-process logs are append-only and
  // the reporter merges every file in the directory, so stale logs from an earlier
  // run would let removed endpoint calls still count as covered.
  rmSync(COVERAGE_DIR, { recursive: true, force: true });
  mkdirSync(COVERAGE_DIR, { recursive: true });

  console.log(`Waiting for ${baseURL}/api/heartbeat ...`);
  await waitForHeartbeat(baseURL, HEARTBEAT_TIMEOUT_MS);

  if (skipSeed) {
    console.log(`Reusing seed state from ${SEED_FILE} (API_SKIP_SEED is set).`);
    return;
  }

  const context = await request.newContext({ baseURL });

  try {
    const started = Date.now();
    const state = await seedEnvironment(new ApiClient(context));

    writeFileSync(SEED_FILE, JSON.stringify(state, null, 2));

    console.log(
      `Seeded ${state.db} environment in ${((Date.now() - started) / 1000).toFixed(1)}s ` +
        `(${state.data.expectedPageviews} pageviews on ${state.website.domain})`,
    );
  } finally {
    await context.dispose();
  }
}
