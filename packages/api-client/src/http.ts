import { UmamiApiError, type UmamiApiErrorBody } from './errors';
import type { HttpMethod, OperationDefinition } from './generated/operations';
import type { FetchLike, RequestOptions, UmamiClientOptions } from './types';

export const DEFAULT_BASE_URL = 'https://api.umami.is/v1';
export const API_KEY_HEADER = 'x-umami-api-key';

type QueryValue = string | number | boolean | Date | null | undefined | QueryValue[];

export function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

/**
 * OpenAPI paths are documented as `/api/...`. The base URL already points at the API root
 * (`https://api.umami.is/v1` or `https://example.com/api`), so the `/api` prefix is dropped.
 */
export function stripApiPrefix(path: string) {
  return path.replace(/^\/api(?=\/|$)/, '');
}

export function buildPath(template: string, params: Record<string, unknown>) {
  return template.replace(/\{([^}]+)}/g, (_, name: string) => {
    const value = params[name];

    if (value === undefined || value === null || value === '') {
      throw new Error(`Missing required path parameter "${name}" for ${template}`);
    }

    return encodeURIComponent(String(value));
  });
}

export function appendQuery(search: URLSearchParams, key: string, value: QueryValue) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendQuery(search, key, item);
    }

    return;
  }

  if (value instanceof Date) {
    search.append(key, value.toISOString());
    return;
  }

  search.append(key, String(value));
}

export function buildUrl(baseUrl: string, path: string, query: Record<string, unknown>) {
  const base = trimSlashes(baseUrl || DEFAULT_BASE_URL);
  const url = new URL(`${base}/${trimSlashes(stripApiPrefix(path))}`);

  for (const [key, value] of Object.entries(query)) {
    appendQuery(url.searchParams, key, value as QueryValue);
  }

  return url;
}

export function buildAuthHeaders(options: Pick<UmamiClientOptions, 'token' | 'apiKey'>) {
  const headers: Record<string, string> = {};

  if (options.apiKey) {
    headers[API_KEY_HEADER] = options.apiKey;
  }

  const bearer = options.token ?? options.apiKey;

  if (bearer) {
    headers.authorization = `Bearer ${bearer}`;
  }

  return headers;
}

export interface SplitInput {
  path: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown> | undefined;
}

/**
 * Splits a flat input object into path params, query params and body according to the operation
 * definition. Unknown keys go to the query string for body-less operations (dynamic filter params
 * such as `browser1` or `pf_*`) and to the body otherwise.
 */
export function splitInput(
  operation: OperationDefinition,
  input: Record<string, unknown> = {},
): SplitInput {
  const path: Record<string, unknown> = {};
  const query: Record<string, unknown> = {};
  const body: Record<string, unknown> = {};
  const pathParams = new Set(operation.pathParams);
  const queryParams = new Set(operation.queryParams);

  for (const [key, value] of Object.entries(input)) {
    if (pathParams.has(key)) {
      path[key] = value;

      if (!operation.hasBody) {
        continue;
      }
    }

    if (queryParams.has(key)) {
      query[key] = value;
    } else if (operation.hasBody) {
      body[key] = value;
    } else if (!pathParams.has(key)) {
      query[key] = value;
    }
  }

  return { path, query, body: operation.hasBody ? body : undefined };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('json')) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new UmamiApiError({
      status: response.status,
      code: 'invalid-json',
      message: 'Response body is not valid JSON',
      method: 'GET',
      url: response.url,
      body: text,
    });
  }
}

export interface HttpRequest {
  method: HttpMethod;
  url: URL;
  headers: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeout?: number;
}

export async function sendRequest<T>(fetchImpl: FetchLike, request: HttpRequest): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json', ...request.headers };
  const init: RequestInit = { method: request.method.toUpperCase(), headers };

  if (request.body !== undefined) {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(request.body);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  if (request.timeout && typeof AbortController !== 'undefined') {
    const controller = new AbortController();

    timer = setTimeout(() => controller.abort(), request.timeout);
    request.signal?.addEventListener('abort', () => controller.abort(), { once: true });
    init.signal = controller.signal;
  } else if (request.signal) {
    init.signal = request.signal;
  }

  let response: Response;

  try {
    response = await fetchImpl(request.url, init);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }

  let body: unknown;

  try {
    body = await parseBody(response);
  } catch (error) {
    if (error instanceof UmamiApiError && response.ok) {
      throw new UmamiApiError({
        status: response.status,
        code: error.code,
        message: error.message,
        method: request.method.toUpperCase(),
        url: request.url.toString(),
        body: error.body,
      });
    }

    body = undefined;
  }

  if (!response.ok) {
    const error = (body as UmamiApiErrorBody | undefined)?.error;

    throw new UmamiApiError({
      status: response.status,
      code: error?.code,
      message: error?.message,
      method: request.method.toUpperCase(),
      url: request.url.toString(),
      body,
    });
  }

  return body as T;
}

export function resolveFetch(custom?: FetchLike): FetchLike {
  if (custom) {
    return custom;
  }

  if (typeof fetch !== 'function') {
    throw new Error('No fetch implementation available. Pass `fetch` in UmamiClient options.');
  }

  return (input, init) => fetch(input, init);
}

export type { RequestOptions };
