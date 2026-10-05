import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { COVERAGE_DIR } from '../paths';
import { createMatcher, getPathname, type PathMatcher } from './matcher';
import { loadOperations } from './oracle';

/**
 * Records every API call made through ApiClient as "METHOD /path/{template}".
 *
 * Playwright workers are separate processes, so each process appends to its
 * own log file; the reporter merges them at the end of the run.
 */
export const UNMATCHED_PREFIX = 'UNMATCHED ';

let enabled = true;
let matcher: PathMatcher | undefined;
let logFile: string | undefined;
const seen = new Set<string>();

/**
 * Global setup calls this so the seeding traffic does not count as coverage —
 * only calls made from specs should satisfy the coverage check.
 */
export function disableCoverageRecording() {
  enabled = false;
}

function getMatcher() {
  if (!matcher) {
    matcher = createMatcher(loadOperations().map(operation => operation.path));
  }

  return matcher;
}

function getLogFile() {
  if (!logFile) {
    mkdirSync(COVERAGE_DIR, { recursive: true });
    logFile = path.join(COVERAGE_DIR, `worker-${process.pid}.log`);
  }

  return logFile;
}

export function recordApiCall(method: string, url: string) {
  if (!enabled) {
    return;
  }

  const template = getMatcher()(url);
  const line = template
    ? `${method.toUpperCase()} ${template}`
    : `${UNMATCHED_PREFIX}${method.toUpperCase()} ${getPathname(url)}`;

  if (seen.has(line)) {
    return;
  }

  seen.add(line);
  appendFileSync(getLogFile(), `${line}\n`);
}
