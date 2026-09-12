import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Server under test (started by scripts/test-api.ts unless PLAYWRIGHT_BASE_URL is set). */
export const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.UMAMI_TEST_PORT ?? '3100'}`;

/**
 * Runtime state shared between global setup, workers and the coverage reporter.
 * Namespaced by target host so concurrent runs against different servers (other
 * ports, worktrees or sessions sharing this checkout) don't clobber each other.
 */
export const RUNTIME_DIR = path.join(
  ROOT_DIR,
  'tests/api/.runtime',
  new URL(BASE_URL).host.replace(/[^a-z0-9.-]+/gi, '-'),
);
export const COVERAGE_DIR = path.join(RUNTIME_DIR, 'coverage');
export const SEED_FILE = path.join(RUNTIME_DIR, 'seed.json');
/**
 * Coverage oracle: the OpenAPI document of the server under test, downloaded by
 * global setup from `${BASE_URL}/openapi.json` (see tests/api/global-setup.ts).
 */
export const OPENAPI_FILE = path.join(RUNTIME_DIR, 'openapi.json');
/** Locally generated spec (`pnpm openapi:generate`), used only as a fallback. */
export const LOCAL_OPENAPI_FILE = path.join(ROOT_DIR, 'public/openapi.json');

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/**
 * The suite is destructive: global setup deletes and recreates fixed-ID websites
 * and ingests analytics data, and specs toggle the global 2FA requirement. Only
 * loopback targets (the local Compose stack) run without an explicit opt-in.
 */
export function assertDisposableTarget(baseURL: string) {
  const { hostname } = new URL(baseURL);

  if (LOOPBACK_HOSTS.has(hostname) || process.env.API_ALLOW_DESTRUCTIVE === '1') {
    return;
  }

  throw new Error(
    `Refusing to run the API suite against ${baseURL}: it deletes and recreates websites, ` +
      'ingests analytics data and changes the global 2FA setting. Point PLAYWRIGHT_BASE_URL ' +
      'at a disposable server and set API_ALLOW_DESTRUCTIVE=1 to confirm.',
  );
}
