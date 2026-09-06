export type OAuthErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'invalid_target'
  | 'access_denied'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_client_metadata'
  | 'invalid_redirect_uri';

export class OAuthError extends Error {
  readonly code: OAuthErrorCode;
  readonly status: number;
  /** When true the error may be delivered to the (validated) redirect URI. */
  readonly redirectable: boolean;

  constructor(
    code: OAuthErrorCode,
    description: string,
    options: { status?: number; redirectable?: boolean } = {},
  ) {
    super(description);
    this.name = 'OAuthError';
    this.code = code;
    this.status = options.status ?? defaultStatus(code);
    this.redirectable = options.redirectable ?? false;
  }

  toJSON() {
    return { error: this.code, error_description: this.message };
  }
}

function defaultStatus(code: OAuthErrorCode) {
  switch (code) {
    case 'invalid_client':
      return 401;
    case 'server_error':
      return 500;
    case 'temporarily_unavailable':
      return 503;
    default:
      return 400;
  }
}

export function isOAuthError(error: unknown): error is OAuthError {
  return error instanceof OAuthError || (error as { name?: string })?.name === 'OAuthError';
}

const NO_STORE = { 'cache-control': 'no-store', pragma: 'no-cache' };

export function oauthJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: { ...NO_STORE, ...(init.headers as Record<string, string>) },
  });
}

export function oauthErrorResponse(error: unknown) {
  if (isOAuthError(error)) {
    const headers: Record<string, string> = {};

    if (error.status === 401) {
      headers['www-authenticate'] = `Bearer error="${error.code}"`;
    }

    return oauthJson(error.toJSON(), { status: error.status, headers });
  }

  return oauthJson(
    { error: 'server_error', error_description: 'Unexpected error.' },
    { status: 500 },
  );
}

export function toOAuthError(error: unknown, fallback: OAuthErrorCode = 'server_error') {
  if (isOAuthError(error)) {
    return error;
  }

  return new OAuthError(fallback, 'Unexpected error.');
}
