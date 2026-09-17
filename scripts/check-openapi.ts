import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatCoverageSummary } from '@/openapi/coverage';
import { buildOpenApiDocument } from '@/openapi/document';
import { getOperationKey } from '@/openapi/operation';
import { serializeOpenApiDocument } from '@/openapi/serialize';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'public', 'openapi.json');
const requireExplicit =
  process.argv.includes('--explicit') || process.env.OPENAPI_REQUIRE_EXPLICIT === '1';
const verbose = process.argv.includes('--verbose');
const { document, coverage } = await buildOpenApiDocument('all', projectRoot);
const expected = serializeOpenApiDocument(document);
let actual = '';

try {
  actual = await readFile(outputFile, 'utf8');
} catch {
  // The comparison below reports the missing generated artifact.
}

let failed = false;

if (actual !== expected) {
  console.error(
    `${path.relative(projectRoot, outputFile)} is stale or missing. Run \`pnpm openapi:generate\`.`,
  );
  failed = true;
}

console.log(formatCoverageSummary(coverage));

if (verbose && coverage.missing.length) {
  coverage.missing.forEach(operation => {
    console.log(`  ${getOperationKey(operation)} (${operation.source})`);
  });
}

if (coverage.missingGenerated.length) {
  console.error('OpenAPI generation must include every discovered API operation.');
  failed = true;
}

if (requireExplicit && coverage.missing.length) {
  console.error('Explicit OpenAPI coverage requires a hand-authored contract for every operation.');
  failed = true;
}

if (failed) {
  process.exitCode = 1;
}
