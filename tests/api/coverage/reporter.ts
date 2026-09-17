import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { FullResult, Reporter } from '@playwright/test/reporter';
import { COVERAGE_DIR } from '../paths';
import { computeCoverage, formatCoverage } from './report';

/**
 * Enforces endpoint coverage at the end of the run.
 *
 * API_COVERAGE=enforce (default)  fail a passing run if any operation is uncovered
 * API_COVERAGE=report             print the summary only
 * API_COVERAGE=off                skip entirely
 */
class ApiCoverageReporter implements Reporter {
  printsToStdio() {
    return true;
  }

  async onEnd(result: FullResult) {
    const mode = process.env.API_COVERAGE ?? 'enforce';

    if (mode === 'off') {
      return;
    }

    const summary = computeCoverage();

    mkdirSync(COVERAGE_DIR, { recursive: true });
    writeFileSync(path.join(COVERAGE_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

    console.log(formatCoverage(summary));

    if (mode !== 'enforce' || summary.uncovered.length === 0) {
      return;
    }

    if (result.status !== 'passed') {
      console.log('API coverage not enforced because the run did not pass.\n');
      return;
    }

    console.log(
      `API coverage check failed: ${summary.uncovered.length} operation(s) were never called. ` +
        'Add a spec that exercises them or an entry in tests/api/coverage/allowlist.ts.\n',
    );

    return { status: 'failed' as const };
  }
}

export default ApiCoverageReporter;
