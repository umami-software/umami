/**
 * Generates `packages/api-client/src/generated/*` from `public/openapi.json`.
 *
 *   pnpm generate:api-client          write generated files
 *   pnpm generate:api-client --check  fail if generated files are stale
 *
 * The OpenAPI document is the single source of truth: operation IDs become client method names,
 * parameter/body/response schemas become input/output types. Never edit generated files by hand.
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import openapiTS, { astToString } from 'openapi-typescript';

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const specFile = path.join(projectRoot, 'public', 'openapi.json');
const outputDir = path.join(projectRoot, 'packages', 'api-client', 'src', 'generated');
const check = process.argv.includes('--check');

const HEADER = `// GENERATED FILE. DO NOT EDIT.
// Source: public/openapi.json — regenerate with \`pnpm generate:api\`.
`;

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
const INCLUDED_AUDIENCES = new Set(['public', 'collect']);
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
}

interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: { required?: boolean };
  'x-umami-audience'?: string;
  'x-umami-oauth-scope'?: string;
}

interface OpenApiDocument {
  info: { version: string };
  paths: Record<string, Record<string, OpenApiOperation>>;
}

interface OperationDefinition {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tags: string[];
  pathParams: string[];
  queryParams: string[];
  requiredQueryParams: string[];
  hasBody: boolean;
  bodyRequired: boolean;
  scope?: string;
}

function collectOperations(document: OpenApiDocument): OperationDefinition[] {
  const operations: OperationDefinition[] = [];
  const seen = new Map<string, string>();
  const errors: string[] = [];

  for (const [route, pathItem] of Object.entries(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (!operation) {
        continue;
      }

      const key = `${method.toUpperCase()} ${route}`;
      const audience = operation['x-umami-audience'] ?? 'public';

      if (!INCLUDED_AUDIENCES.has(audience)) {
        continue;
      }

      const operationId = operation.operationId;

      if (!operationId) {
        errors.push(`${key} has no operationId.`);
        continue;
      }

      if (!IDENTIFIER.test(operationId)) {
        errors.push(`${key} has an operationId that is not a valid identifier: ${operationId}`);
        continue;
      }

      const previous = seen.get(operationId);

      if (previous) {
        errors.push(`Duplicate operationId ${operationId}: ${previous} and ${key}`);
        continue;
      }

      seen.set(operationId, key);

      const parameters = operation.parameters ?? [];
      const pathParams = [...route.matchAll(/\{([^}]+)}/g)].map(match => match[1]);
      const queryParams = parameters
        .filter(parameter => parameter.in === 'query')
        .map(parameter => parameter.name);
      const requiredQueryParams = parameters
        .filter(parameter => parameter.in === 'query' && parameter.required)
        .map(parameter => parameter.name);

      operations.push({
        operationId,
        method,
        path: route,
        summary: operation.summary ?? operationId,
        description: operation.description,
        tags: operation.tags ?? [],
        pathParams,
        queryParams,
        requiredQueryParams,
        hasBody: !!operation.requestBody,
        bodyRequired: operation.requestBody?.required !== false && !!operation.requestBody,
        scope: operation['x-umami-oauth-scope'],
      });
    }
  }

  if (errors.length) {
    throw new Error(`Cannot generate API client:\n${errors.map(error => `- ${error}`).join('\n')}`);
  }

  return operations.sort((left, right) => left.operationId.localeCompare(right.operationId));
}

function jsDoc(lines: (string | undefined)[]) {
  const content = lines.filter((line): line is string => !!line);

  if (!content.length) {
    return '';
  }

  return `  /**\n${content.map(line => `   * ${line.replace(/\*\//g, '* /')}`).join('\n')}\n   */\n`;
}

function renderOperations(operations: OperationDefinition[], version: string) {
  const table = operations
    .map(operation => {
      const fields = [
        `operationId: '${operation.operationId}'`,
        `method: '${operation.method}'`,
        `path: '${operation.path}'`,
        `pathParams: [${operation.pathParams.map(name => `'${name}'`).join(', ')}]`,
        `queryParams: [${operation.queryParams.map(name => `'${name}'`).join(', ')}]`,
        `hasBody: ${operation.hasBody}`,
        ...(operation.scope ? [`scope: '${operation.scope}'`] : []),
      ];

      return `  ${operation.operationId}: { ${fields.join(', ')} },`;
    })
    .join('\n');

  const methods = operations
    .map(operation => {
      const inputOptional =
        !operation.pathParams.length &&
        !operation.requiredQueryParams.length &&
        !operation.bodyRequired;
      const doc = jsDoc([
        operation.summary,
        operation.description ? '' : undefined,
        operation.description,
        '',
        `\`${operation.method.toUpperCase()} ${operation.path}\``,
        operation.scope ? `OAuth scope: \`${operation.scope}\`` : undefined,
      ]);
      const id = operation.operationId;

      return `${doc}  ${id}(input${inputOptional ? '?' : ''}: OperationInput<'${id}'>, options?: RequestOptions): Promise<OperationOutput<'${id}'>> {
    return this.execute('${id}', input, options);
  }`;
    })
    .join('\n\n');

  return `${HEADER}
import type { RequestOptions } from '../types';
import type { components, operations as OperationTypes } from './types';

export const API_VERSION = '${version}';

export type HttpMethod = ${HTTP_METHODS.map(method => `'${method}'`).join(' | ')};

export interface OperationDefinition {
  readonly operationId: string;
  readonly method: HttpMethod;
  readonly path: string;
  readonly pathParams: readonly string[];
  readonly queryParams: readonly string[];
  readonly hasBody: boolean;
  readonly scope?: string;
}

export const operations = {
${table}
} as const satisfies Record<string, OperationDefinition>;

export type OperationId = keyof typeof operations;

export type Schemas = components['schemas'];

type Clean<T> = [T] extends [never] ? Record<never, never> : T;

type OperationPathParams<K extends OperationId> = OperationTypes[K]['parameters'] extends {
  path: infer P;
}
  ? Clean<P>
  : Record<never, never>;

type OperationQuery<K extends OperationId> = Clean<
  NonNullable<OperationTypes[K]['parameters']['query']>
>;

type OperationBody<K extends OperationId> = OperationTypes[K] extends { requestBody?: infer R }
  ? NonNullable<R> extends { content: { 'application/json': infer B } }
    ? Clean<B>
    : Record<never, never>
  : Record<never, never>;

export type OperationInput<K extends OperationId> = OperationPathParams<K> &
  OperationQuery<K> &
  OperationBody<K> &
  Record<string, unknown>;

export type OperationOutput<K extends OperationId> = OperationTypes[K]['responses'] extends {
  200: { content: { 'application/json': infer R } };
}
  ? R
  : unknown;

export abstract class GeneratedUmamiClient {
  protected abstract execute<K extends OperationId>(
    operationId: K,
    input: Record<string, unknown> | undefined,
    options?: RequestOptions,
  ): Promise<OperationOutput<K>>;

${methods}
}
`;
}

async function format(files: string[]) {
  const biome = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'biome.cmd' : 'biome',
  );

  await execFileAsync(biome, ['format', '--write', ...files], {
    cwd: projectRoot,
    shell: process.platform === 'win32',
  });
}

async function readExisting(file: string) {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

const document = JSON.parse(await readFile(specFile, 'utf8')) as OpenApiDocument;
const operations = collectOperations(document);
const ast = await openapiTS(document as never, {
  alphabetize: true,
  exportType: false,
});

const files: Record<string, string> = {
  'types.ts': `${HEADER}\n${astToString(ast)}`,
  'operations.ts': renderOperations(operations, document.info.version),
};

const tmpDir = path.join(outputDir, check ? '.check' : '');

await mkdir(tmpDir, { recursive: true });

const written: string[] = [];

for (const [name, content] of Object.entries(files)) {
  const file = path.join(tmpDir, name);
  await writeFile(file, content, 'utf8');
  written.push(file);
}

await format(written);

if (check) {
  let stale = false;

  for (const name of Object.keys(files)) {
    const [expected, actual] = await Promise.all([
      readFile(path.join(tmpDir, name), 'utf8'),
      readExisting(path.join(outputDir, name)),
    ]);

    if (expected !== actual) {
      console.error(
        `packages/api-client/src/generated/${name} is stale. Run \`pnpm generate:api\`.`,
      );
      stale = true;
    }
  }

  const { rm } = await import('node:fs/promises');
  await rm(tmpDir, { recursive: true, force: true });

  if (stale) {
    process.exit(1);
  }

  console.log(`API client is up to date (${operations.length} operations).`);
} else {
  console.log(
    `Generated ${operations.length} operations into ${path.relative(projectRoot, outputDir)}.`,
  );
}
