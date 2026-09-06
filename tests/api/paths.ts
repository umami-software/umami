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
export const OPENAPI_FILE = path.join(ROOT_DIR, 'public/openapi.json');
