import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { formatCoverageSummary } from '@/openapi/coverage';
import { buildOpenApiDocument } from '@/openapi/document';
import { serializeOpenApiDocument } from '@/openapi/serialize';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'public', 'openapi.json');
const { document, coverage } = await buildOpenApiDocument('all', projectRoot);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, serializeOpenApiDocument(document), 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputFile)}.`);
console.log(formatCoverageSummary(coverage));
