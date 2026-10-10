export { UmamiClient } from './client';
export { isUmamiApiError, UmamiApiError, type UmamiApiErrorBody } from './errors';
export {
  API_VERSION,
  type HttpMethod,
  type OperationDefinition,
  type OperationId,
  type OperationInput,
  type OperationOutput,
  operations,
  type Schemas,
} from './generated/operations';
export type { components, operations as OperationTypes, paths } from './generated/types';
export { API_KEY_HEADER, DEFAULT_BASE_URL } from './http';
export type { FetchLike, RequestOptions, UmamiClientOptions } from './types';
