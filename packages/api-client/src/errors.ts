export interface UmamiApiErrorBody {
  error?: {
    message?: string;
    code?: string;
    status?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Thrown for any non-2xx response. `code` mirrors the API's error code
 * (`unauthorized`, `forbidden`, `not-found`, `bad-request`, `server-error`, …).
 */
export class UmamiApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly method: string;
  readonly url: string;
  readonly body: unknown;

  constructor(options: {
    status: number;
    code?: string;
    message?: string;
    method: string;
    url: string;
    body?: unknown;
  }) {
    super(options.message ?? defaultMessage(options.status));
    this.name = 'UmamiApiError';
    this.status = options.status;
    this.code = options.code ?? defaultCode(options.status);
    this.method = options.method;
    this.url = options.url;
    this.body = options.body;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

export function isUmamiApiError(error: unknown): error is UmamiApiError {
  return error instanceof UmamiApiError || (error as { name?: string })?.name === 'UmamiApiError';
}

function defaultCode(status: number) {
  switch (status) {
    case 400:
      return 'bad-request';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not-found';
    case 413:
      return 'payload-too-large';
    case 429:
      return 'rate-limited';
    case 503:
      return 'service-unavailable';
    default:
      return status >= 500 ? 'server-error' : 'request-failed';
  }
}

function defaultMessage(status: number) {
  switch (status) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 429:
      return 'Too many requests';
    default:
      return status >= 500 ? 'Server error' : `Request failed with status ${status}`;
  }
}
