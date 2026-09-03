import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createDocument, type ZodOpenApiPathsObject } from 'zod-openapi';
import { getContractOAuthScope, OAUTH_ROUTE_SCOPES } from '@/lib/oauth/scopes';
import { loadApiContracts } from '@/openapi/contracts';
import {
  analyzeContractCoverage,
  type ContractCoverage,
  getCoverageErrors,
} from '@/openapi/coverage';
import { discoverApiOperations } from '@/openapi/discover';
import { inferApiContracts } from '@/openapi/infer';
import { type ApiAudience, type ApiOperationContract, getOperationKey } from '@/openapi/operation';
import { errorResponseComponents } from '@/openapi/schemas';
import { getSecurityRequirements, securitySchemes } from '@/openapi/security';

export type DocumentAudience = ApiAudience | 'all';

export interface OpenApiBuildResult {
  document: ReturnType<typeof createDocument>;
  coverage: ContractCoverage;
}

async function getPackageVersion(projectRoot: string) {
  const packageJson = JSON.parse(
    await readFile(path.join(projectRoot, 'package.json'), 'utf8'),
  ) as { version: string };

  return packageJson.version;
}

/**
 * Every OAuth-allowlisted route must correspond to a real API route, otherwise the runtime
 * allowlist and the published contract silently drift apart.
 */
function getOAuthRouteErrors(discovered: Pick<ApiOperationContract, 'method' | 'path'>[]) {
  const discoveredKeys = new Set(discovered.map(getOperationKey));

  return OAUTH_ROUTE_SCOPES.filter(route => !discoveredKeys.has(getOperationKey(route))).map(
    route =>
      `OAuth scope allowlist entry does not match a route: ${getOperationKey(route)} (src/lib/oauth/scopes.ts)`,
  );
}

function getDocumentTags(paths: ZodOpenApiPathsObject) {
  const names = new Set<string>();

  Object.values(paths).forEach(pathItem => {
    Object.values(pathItem).forEach(value => {
      if (value && typeof value === 'object' && 'tags' in value && Array.isArray(value.tags)) {
        value.tags.forEach(tag => {
          names.add(tag);
        });
      }
    });
  });

  return [...names].sort().map(name => ({ name }));
}

export async function buildOpenApiDocument(
  audience: DocumentAudience = 'public',
  projectRoot = process.cwd(),
): Promise<OpenApiBuildResult> {
  const [explicitContracts, discovered, version] = await Promise.all([
    loadApiContracts(projectRoot),
    discoverApiOperations(projectRoot),
    getPackageVersion(projectRoot),
  ]);
  const inferredContracts = inferApiContracts(discovered, explicitContracts);
  const contracts = [...explicitContracts, ...inferredContracts];
  const coverage = analyzeContractCoverage(discovered, explicitContracts, contracts);
  const errors = [...getCoverageErrors(coverage), ...getOAuthRouteErrors(discovered)];

  if (errors.length) {
    throw new Error(`Invalid OpenAPI contracts:\n${errors.map(error => `- ${error}`).join('\n')}`);
  }

  const selectedContracts = contracts
    .filter(contract => audience === 'all' || contract.audience === audience)
    .sort((left, right) =>
      `${left.path}:${left.method}`.localeCompare(`${right.path}:${right.method}`),
    );
  const paths: ZodOpenApiPathsObject = {};

  selectedContracts.forEach(contract => {
    let pathItem = paths[contract.path];

    if (!pathItem) {
      pathItem = {};
      paths[contract.path] = pathItem;
    }

    const scope = getContractOAuthScope(contract.method, contract.path);
    const operation = {
      ...contract.operation,
      security: getSecurityRequirements(contract.auth, scope),
      'x-umami-audience': contract.audience,
      'x-umami-contract': contract.origin,
      'x-umami-source': contract.source,
      ...(scope ? { 'x-umami-oauth-scope': scope } : {}),
    };

    Object.assign(pathItem, { [contract.method]: operation });
  });

  const document = createDocument(
    {
      openapi: '3.1.0',
      info: {
        title: 'Umami API',
        version,
        description:
          'REST API for Umami analytics. Every App Router API operation is included. Operations marked with x-umami-contract: inferred are generated from handler source; colocated explicit contracts provide curated descriptions and exact response models. Self-hosted deployments serve these paths beneath their configured BASE_PATH.',
        license: {
          name: 'MIT',
          identifier: 'MIT',
        },
      },
      externalDocs: {
        description: 'Umami API documentation',
        url: 'https://docs.umami.is/docs/api',
      },
      tags: getDocumentTags(paths),
      paths,
      components: {
        securitySchemes,
        responses: errorResponseComponents,
      },
    },
    {
      reused: 'inline',
      cycles: 'ref',
    },
  );

  return { document, coverage };
}
