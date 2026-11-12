import { existsSync, readFileSync } from 'node:fs';
import { OPENAPI_FILE } from '../paths';

/**
 * The coverage oracle is the generated OpenAPI document. `pnpm build` cannot
 * succeed with an undocumented route (see src/openapi/coverage.ts), so every
 * operation in public/openapi.json is exactly the set of endpoints that exist.
 */
export interface ApiOperation {
  /** Same format as src/openapi/operation.ts getOperationKey: "GET /api/websites" */
  key: string;
  method: string;
  /** OpenAPI path template, e.g. "/api/websites/{websiteId}" */
  path: string;
  /** Route file that implements the operation (x-umami-source) */
  source: string;
  tag: string;
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

let cached: ApiOperation[] | undefined;

export function loadOperations(): ApiOperation[] {
  if (cached) {
    return cached;
  }

  if (!existsSync(OPENAPI_FILE)) {
    throw new Error(
      `Coverage oracle ${OPENAPI_FILE} is missing. It is written by tests/api/global-setup.ts; ` +
        'run the suite through `pnpm test:api` or `pnpm test:api:run` rather than importing specs directly.',
    );
  }

  const document = JSON.parse(readFileSync(OPENAPI_FILE, 'utf8'));
  const operations: ApiOperation[] = [];

  for (const [pathTemplate, pathItem] of Object.entries<Record<string, any>>(
    document.paths ?? {},
  )) {
    for (const method of METHODS) {
      const operation = pathItem?.[method];

      if (!operation) {
        continue;
      }

      operations.push({
        key: `${method.toUpperCase()} ${pathTemplate}`,
        method: method.toUpperCase(),
        path: pathTemplate,
        source: operation['x-umami-source'] ?? '',
        tag: operation.tags?.[0] ?? 'Other',
      });
    }
  }

  cached = operations.sort(
    (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
  );

  return cached;
}
