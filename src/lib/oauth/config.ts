import { getBaseUrl } from '@/lib/get-base-url';

/** Authorization codes are single-use and short-lived (OAuth 2.1 recommends ≤ 10 minutes). */
export const AUTHORIZATION_CODE_TTL_SECONDS = 10 * 60;
/** Access tokens are short-lived JWTs; refresh tokens carry long-lived sessions. */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
/** Cache lifetime for fetched Client ID Metadata Documents. */
export const CLIENT_METADATA_CACHE_SECONDS = 60 * 60;

export const OAUTH_ACCESS_TOKEN_TYPE = 'oauth_access';
export const REFRESH_TOKEN_PREFIX = 'umami_rt_';
export const MCP_RESOURCE_PATH = '/mcp';

export function isOAuthEnabled() {
  return process.env.OAUTH_DISABLED !== '1' && !process.env.DISABLE_LOGIN;
}

export function isDynamicRegistrationEnabled() {
  return isOAuthEnabled() && process.env.OAUTH_DISABLE_DCR !== '1';
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

/**
 * The OAuth issuer identifier: the public base URL of this Umami instance (including any
 * BASE_PATH). Can be pinned with `OAUTH_ISSUER` for deployments behind proxies that do not
 * forward host headers.
 */
export function getIssuer(headers?: Pick<Headers, 'get'>) {
  const configured = process.env.OAUTH_ISSUER?.trim();

  if (configured) {
    return trimTrailingSlash(configured);
  }

  const base = trimTrailingSlash(getBaseUrl(headers).toString());
  const basePath = trimTrailingSlash(process.env.BASE_PATH ?? '');

  return `${base}${basePath}`;
}

/** Canonical resource identifier for the embedded MCP server (RFC 8707). */
export function getMcpResource(issuer: string) {
  return `${trimTrailingSlash(issuer)}${MCP_RESOURCE_PATH}`;
}

export interface OAuthEndpoints {
  issuer: string;
  resource: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
  registrationEndpoint?: string;
  authorizationServerMetadata: string;
  protectedResourceMetadata: string;
}

export function getOAuthEndpoints(headers?: Pick<Headers, 'get'>): OAuthEndpoints {
  const issuer = getIssuer(headers);

  return {
    issuer,
    resource: getMcpResource(issuer),
    authorizationEndpoint: `${issuer}/oauth/authorize`,
    tokenEndpoint: `${issuer}/api/oauth/token`,
    revocationEndpoint: `${issuer}/api/oauth/revoke`,
    registrationEndpoint: isDynamicRegistrationEnabled()
      ? `${issuer}/api/oauth/register`
      : undefined,
    authorizationServerMetadata: `${issuer}/.well-known/oauth-authorization-server`,
    protectedResourceMetadata: `${issuer}/.well-known/oauth-protected-resource${MCP_RESOURCE_PATH}`,
  };
}

/**
 * Normalizes a resource indicator for comparison: lowercase scheme/host, no trailing slash,
 * no fragment.
 */
export function normalizeResource(value: string) {
  try {
    const url = new URL(value);

    if (url.hash) {
      return null;
    }

    url.hash = '';

    return trimTrailingSlash(url.toString());
  } catch {
    return null;
  }
}
