import { isUmamiApiError } from '@umami/api-client';

export type McpToolErrorCode =
  | 'invalid_input'
  | 'invalid_date'
  | 'invalid_date_range'
  | 'auth_expired'
  | 'access_denied'
  | 'not_found'
  | 'rate_limited'
  | 'api_error'
  | 'network_error'
  | 'unknown';

export class McpToolError extends Error {
  readonly code: McpToolErrorCode;

  constructor(code: McpToolErrorCode, message: string) {
    super(message);
    this.name = 'McpToolError';
    this.code = code;
  }
}

export interface DescribedError {
  code: McpToolErrorCode;
  message: string;
  status?: number;
  details?: unknown;
}

interface ErrorContext {
  websiteId?: string;
  sessionId?: string;
  resource?: string;
}

function resourceLabel(context: ErrorContext) {
  if (context.sessionId) {
    return `session ${context.sessionId}`;
  }

  if (context.websiteId) {
    return `website ${context.websiteId}`;
  }

  return context.resource ?? 'this resource';
}

function sanitizeDetails(details: unknown) {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  // Validation errors from the API are safe to surface; drop everything else.
  const {
    message: _message,
    code: _code,
    status: _status,
    ...rest
  } = details as Record<string, unknown>;

  return Object.keys(rest).length ? rest : undefined;
}

/**
 * Converts any thrown error into a user-facing description. Never leaks stack traces,
 * database details or tokens.
 */
export function describeError(error: unknown, context: ErrorContext = {}): DescribedError {
  if (error instanceof McpToolError) {
    return { code: error.code, message: error.message };
  }

  if (isUmamiApiError(error)) {
    const label = resourceLabel(context);
    const apiError = (error.body as { error?: Record<string, unknown> } | undefined)?.error;

    switch (error.status) {
      case 400:
        return {
          code: 'invalid_input',
          status: 400,
          message: `Umami rejected the request as invalid${error.message && error.message !== 'Bad request' ? `: ${error.message}` : ''}. Check the parameters and try again.`,
          details: sanitizeDetails(apiError),
        };
      case 401:
        return {
          code: context.websiteId || context.sessionId ? 'access_denied' : 'auth_expired',
          status: 401,
          message:
            context.websiteId || context.sessionId
              ? `You do not have access to ${label}, or your Umami authorization has expired. Use list_websites to see the websites you can access, and re-authorize if the problem persists.`
              : 'Umami authentication failed or has expired. Re-authorize the connection and try again.',
        };
      case 403:
        return {
          code: 'access_denied',
          status: 403,
          message: `You do not have permission to access ${label}${error.code === 'insufficient_scope' ? ' with the granted OAuth scopes' : ''}.`,
        };
      case 404:
        return {
          code: 'not_found',
          status: 404,
          message: `${label[0].toUpperCase()}${label.slice(1)} was not found.`,
        };
      case 429:
        return {
          code: 'rate_limited',
          status: 429,
          message: 'Umami is rate limiting requests. Wait a moment before trying again.',
        };
      default:
        return {
          code: 'api_error',
          status: error.status,
          message:
            error.status >= 500
              ? 'Umami returned a server error. Try again later.'
              : `Umami request failed with status ${error.status}.`,
        };
    }
  }

  if (error instanceof TypeError && /fetch|network|ECONNREFUSED|ENOTFOUND/i.test(error.message)) {
    return {
      code: 'network_error',
      message: 'Could not reach the Umami API. Check the server URL and network connectivity.',
    };
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return { code: 'network_error', message: 'The request to Umami timed out.' };
  }

  return { code: 'unknown', message: 'An unexpected error occurred while calling Umami.' };
}
