import type {
  ZodOpenApiOperationObject,
  ZodOpenApiParameterObject,
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
  ZodOpenApiSchemaObject,
} from 'zod-openapi';
import type { DiscoveredApiOperation } from '@/openapi/discover';
import type { ApiAudience, ApiHttpMethod, LoadedApiOperationContract } from '@/openapi/operation';
import { getOperationKey } from '@/openapi/operation';
import { getOperationIdOverride } from '@/openapi/operation-ids';
import {
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  okSchema,
  payloadTooLargeResponse,
  serverErrorResponse,
  serviceUnavailableResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';
import type { InferredOpenApiSchema } from '@/openapi/source-analysis';

const errorResponses: Record<number, ZodOpenApiResponseObject> = {
  400: badRequestResponse,
  401: unauthorizedResponse,
  403: forbiddenResponse,
  404: notFoundResponse,
  413: payloadTooLargeResponse,
  500: serverErrorResponse,
  503: serviceUnavailableResponse,
};

const TAGS: Record<string, string> = {
  '2fa': 'Two-factor authentication',
  admin: 'Administration',
  auth: 'Authentication',
  batch: 'Collection',
  boards: 'Boards',
  config: 'Configuration',
  dashboard: 'Dashboard',
  heartbeat: 'System',
  links: 'Links',
  me: 'Account',
  pixels: 'Pixels',
  realtime: 'Realtime',
  record: 'Collection',
  reports: 'Reports',
  scripts: 'Scripts',
  send: 'Collection',
  share: 'Shares',
  teams: 'Teams',
  users: 'Users',
  websites: 'Websites',
};

function getPathSegments(path: string) {
  return path.split('/').filter(Boolean).slice(1);
}

function words(value: string) {
  return value
    .replace(/[{}]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .toLowerCase();
}

function pascalCase(value: string) {
  return words(value)
    .split(' ')
    .filter(Boolean)
    .map(word => `${word[0]?.toUpperCase()}${word.slice(1)}`)
    .join('');
}

function getOperationId(method: ApiHttpMethod, path: string) {
  return `${method}${getPathSegments(path).map(pascalCase).join('')}`;
}

function getSummary(method: ApiHttpMethod, path: string) {
  const action: Record<ApiHttpMethod, string> = {
    get: 'Get',
    post: 'Create or update',
    put: 'Replace',
    patch: 'Update',
    delete: 'Delete',
    head: 'Inspect',
    options: 'Inspect options for',
  };
  const label = getPathSegments(path)
    .map(segment => words(segment))
    .join(' ');

  return `${action[method]} ${label}`;
}

function getAudience(path: string): ApiAudience {
  if (
    path === '/api/send' ||
    path === '/api/batch' ||
    path === '/api/record' ||
    path.endsWith('/recorder')
  ) {
    return 'collect';
  }

  if (
    ['/api/admin', '/api/config', '/api/dashboard', '/api/heartbeat', '/api/scripts'].some(
      prefix => path === prefix || path.startsWith(`${prefix}/`),
    )
  ) {
    return 'internal';
  }

  return 'public';
}

function getTag(path: string) {
  const root = getPathSegments(path)[0] ?? 'api';
  return TAGS[root] ?? pascalCase(root);
}

function getPathParameters(path: string): ZodOpenApiParameterObject[] {
  return [...path.matchAll(/\{([^}]+)}/g)].map(match => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));
}

function getQueryParameters(schema: InferredOpenApiSchema | undefined) {
  if (schema?.type !== 'object' || !schema.properties) {
    return [];
  }

  const required = new Set((schema.required ?? []) as string[]);

  return Object.entries(schema.properties).map(([name, propertySchema]) => ({
    name,
    in: 'query' as const,
    required: required.has(name),
    schema: propertySchema,
  }));
}

function successResponse(
  mediaType: string,
  returnsOk: boolean,
  schema?: InferredOpenApiSchema,
): ZodOpenApiResponseObject {
  return {
    description:
      schema || returnsOk
        ? 'The operation completed successfully.'
        : 'Successful response. The response shape is inferred as free-form because the handler does not expose a reusable response schema.',
    content: {
      [mediaType]: {
        schema: schema
          ? (schema as ZodOpenApiSchemaObject)
          : returnsOk
            ? okSchema
            : mediaType === 'application/json'
              ? ({} as ZodOpenApiSchemaObject)
              : ({ type: 'string' } as ZodOpenApiSchemaObject),
      },
    },
  };
}

function getResponses(operation: DiscoveredApiOperation): ZodOpenApiResponsesObject {
  const responses: ZodOpenApiResponsesObject = {};

  operation.analysis.responseStatuses.forEach(status => {
    const response = errorResponses[status];
    responses[`${status}` as `${1 | 2 | 3 | 4 | 5}${string}`] =
      response ??
      successResponse(
        operation.analysis.responseMediaType,
        operation.analysis.returnsOk,
        operation.analysis.responseSchemas[status],
      );
  });

  return responses;
}

function getOperation(operation: DiscoveredApiOperation): ZodOpenApiOperationObject {
  const { analysis, method, path, source } = operation;
  const parameters = [
    ...getPathParameters(path),
    ...(method === 'get' ? getQueryParameters(analysis.requestSchema) : []),
  ];
  const requestBody =
    method !== 'get' && analysis.hasRequestSchema
      ? {
          required: true,
          content: {
            'application/json': {
              schema: analysis.requestSchema ?? ({} as ZodOpenApiSchemaObject),
            },
          },
        }
      : undefined;

  return {
    operationId: getOperationIdOverride(method, path) ?? getOperationId(method, path),
    summary: getSummary(method, path),
    description:
      'Generated from the App Router handler and its request-validation source. Add a colocated contract.ts to supply exact response models and curated documentation.',
    tags: [getTag(path)],
    ...(parameters.length ? { parameters } : {}),
    ...(requestBody ? { requestBody } : {}),
    responses: getResponses(operation),
    'x-umami-source': source,
  } as ZodOpenApiOperationObject;
}

export function inferApiContracts(
  discovered: DiscoveredApiOperation[],
  explicit: LoadedApiOperationContract[],
): LoadedApiOperationContract[] {
  const explicitKeys = new Set(explicit.map(getOperationKey));

  return discovered
    .filter(
      operation => operation.method !== 'options' && !explicitKeys.has(getOperationKey(operation)),
    )
    .map(operation => ({
      method: operation.method,
      path: operation.path,
      audience: getAudience(operation.path),
      auth: operation.analysis.auth,
      operation: getOperation(operation),
      source: operation.source,
      origin: 'inferred',
    }));
}
