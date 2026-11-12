/* eslint-disable no-console */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { type FullConfig, request } from '@playwright/test';
import { ApiClient } from './client';
import { disableCoverageRecording } from './coverage/recorder';
import {
  assertDisposableTarget,
  COVERAGE_DIR,
  LOCAL_OPENAPI_FILE,
  OPENAPI_FILE,
  SEED_FILE,
} from './paths';
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

/**
 * The coverage oracle must describe the server actually under test, so fetch its
 * generated OpenAPI document rather than assuming a local `pnpm build` ran.
 * public/openapi.json is a gitignored build artifact and is usually absent in a
 * checkout that only runs the Compose stack.
 */
async function fetchOpenApiDocument(baseURL: string) {
  const url = `${baseURL}/openapi.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const document = await response.json();

    if (!document?.paths) {
      throw new Error('response has no "paths" object');
    }

    writeFileSync(OPENAPI_FILE, JSON.stringify(document));
    return;
  } catch (error) {
    if (existsSync(LOCAL_OPENAPI_FILE)) {
      console.warn(
        `Could not fetch ${url} (${(error as Error).message}); ` +
          `using the locally generated ${LOCAL_OPENAPI_FILE} as the coverage oracle instead.`,
      );
      copyFileSync(LOCAL_OPENAPI_FILE, OPENAPI_FILE);
      return;
    }

    throw new Error(
      `Could not fetch the OpenAPI document from ${url} (${(error as Error).message}) and no ` +
        `local ${LOCAL_OPENAPI_FILE} exists. The server under test must serve its generated spec ` +
        '(it is built by `pnpm build:openapi`), or generate it locally with `pnpm openapi:generate`.',
    );
  }
}

export default async function globalSetup(config: FullConfig) {
  // Seeding traffic must not count towards endpoint coverage.
  disableCoverageRecording();

  const baseURL = config.projects[0]?.use?.baseURL;

  if (!baseURL) {
    throw new Error('playwright.api.config.ts must define use.baseURL');
  }

  assertDisposableTarget(baseURL);

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
  await fetchOpenApiDocument(baseURL);

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
