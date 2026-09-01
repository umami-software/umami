import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatCoverageSummary } from '@/openapi/coverage';
import { buildOpenApiDocument } from '@/openapi/document';
import { getOperationKey } from '@/openapi/operation';
import { serializeOpenApiDocument } from '@/openapi/serialize';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'public', 'openapi.json');
const strict = process.argv.includes('--strict') || process.env.OPENAPI_REQUIRE_COMPLETE === '1';
const verbose = process.argv.includes('--verbose');
const { document, coverage } = await buildOpenApiDocument('public', projectRoot);
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

if (strict && coverage.missing.length) {
  console.error('Strict OpenAPI coverage requires an explicit contract for every API operation.');
  failed = true;
}

if (failed) {
  process.exitCode = 1;
}
