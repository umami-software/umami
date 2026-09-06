import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { COVERAGE_DIR } from '../paths';
import { allowlist } from './allowlist';
import { type ApiOperation, loadOperations } from './oracle';
import { UNMATCHED_PREFIX } from './recorder';

export interface CoverageSummary {
  total: number;
  covered: string[];
  allowlisted: string[];
  uncovered: ApiOperation[];
  /** Allowlisted operations that were actually called — the entry can be removed. */
  staleAllowlist: string[];
  /** Allowlist keys that don't exist in the OpenAPI document. */
  unknownAllowlist: string[];
  /** Calls whose path could not be mapped to any documented operation. */
  unmatched: string[];
}

export function readRecordedCalls() {
  const covered = new Set<string>();
  const unmatched = new Set<string>();

  if (!existsSync(COVERAGE_DIR)) {
    return { covered, unmatched };
  }

  for (const file of readdirSync(COVERAGE_DIR)) {
    if (!file.endsWith('.log')) {
      continue;
    }

    for (const line of readFileSync(path.join(COVERAGE_DIR, file), 'utf8').split('\n')) {
      const entry = line.trim();

      if (!entry) {
        continue;
      }

      if (entry.startsWith(UNMATCHED_PREFIX)) {
        unmatched.add(entry.slice(UNMATCHED_PREFIX.length));
      } else {
        covered.add(entry);
      }
    }
  }

  return { covered, unmatched };
}

export function computeCoverage(): CoverageSummary {
  const operations = loadOperations();
  const { covered, unmatched } = readRecordedCalls();
  const known = new Set(operations.map(operation => operation.key));
  const db = process.env.UMAMI_TEST_DB === 'clickhouse' ? 'clickhouse' : 'postgres';
  const allowed = new Set(
    allowlist.filter(entry => !entry.db || entry.db === db).map(entry => entry.key),
  );

  return {
    total: operations.length,
    covered: operations.filter(op => covered.has(op.key)).map(op => op.key),
    allowlisted: [...allowed].filter(key => known.has(key) && !covered.has(key)),
    uncovered: operations.filter(op => !covered.has(op.key) && !allowed.has(op.key)),
    staleAllowlist: [...allowed].filter(key => covered.has(key)),
    unknownAllowlist: [...allowed].filter(key => !known.has(key)),
    unmatched: [...unmatched].sort(),
  };
}

function groupByTag(operations: ApiOperation[]) {
  const groups = new Map<string, ApiOperation[]>();

  for (const operation of operations) {
    const group = groups.get(operation.tag) ?? [];
    group.push(operation);
    groups.set(operation.tag, group);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function formatCoverage(summary: CoverageSummary): string {
  const lines: string[] = [];
  const { total, covered, allowlisted, uncovered } = summary;

  lines.push('');
  lines.push(
    `API coverage: ${covered.length + allowlisted.length}/${total} operations ` +
      `(${covered.length} covered, ${allowlisted.length} allowlisted, ${uncovered.length} uncovered)`,
  );

  if (uncovered.length) {
    lines.push('');
    lines.push('Uncovered operations:');

    for (const [tag, operations] of groupByTag(uncovered)) {
      lines.push(`  ${tag}`);

      for (const operation of operations) {
        const source = operation.source ? `  <- ${operation.source}` : '';
        lines.push(`    ${operation.key}${source}`);
      }
    }
  }

  if (summary.staleAllowlist.length) {
    lines.push('');
    lines.push('Allowlisted operations that were called (remove them from coverage/allowlist.ts):');

    for (const key of summary.staleAllowlist) {
      lines.push(`  ${key}`);
    }
  }

  if (summary.unknownAllowlist.length) {
    lines.push('');
    lines.push('Allowlist entries that do not exist in public/openapi.json:');

    for (const key of summary.unknownAllowlist) {
      lines.push(`  ${key}`);
    }
  }

  if (summary.unmatched.length) {
    lines.push('');
    lines.push('Calls that did not match any documented operation:');

    for (const entry of summary.unmatched) {
      lines.push(`  ${entry}`);
    }
  }

  lines.push('');

  return lines.join('\n');
}
