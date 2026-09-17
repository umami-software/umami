import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const API_HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
] as const;

export type ApiHttpMethod = (typeof API_HTTP_METHODS)[number];
export type ApiAudience = 'public' | 'internal' | 'collect';
export type ApiAuth = 'none' | 'bearer' | 'bearer-or-share';

export interface ApiOperationContract {
  method: ApiHttpMethod;
  path: `/${string}`;
  audience: ApiAudience;
  auth: ApiAuth;
  operation: ZodOpenApiOperationObject;
}

export interface LoadedApiOperationContract extends ApiOperationContract {
  source: string;
  origin: 'explicit' | 'inferred';
}

export function defineOperation<const T extends ApiOperationContract>(contract: T): T {
  return contract;
}

export function getOperationKey({ method, path }: Pick<ApiOperationContract, 'method' | 'path'>) {
  return `${method.toUpperCase()} ${path}`;
}
