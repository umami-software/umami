import type { AuthInfo } from '@umami/mcp';
import { isApiKey, isApiKeyEnabled } from '@/lib/api-key';
import { checkApiKeyAuth, getBearerToken } from '@/lib/auth';
import { getIssuer, getOAuthEndpoints, isOAuthEnabled } from '@/lib/oauth/config';
import { OAUTH_SCOPES } from '@/lib/oauth/scopes';
import { looksLikeAccessToken, verifyAccessToken } from '@/lib/oauth/tokens';
import { buildOAuthAuth } from '@/lib/oauth/verify';

export type McpAuthResult =
  | { ok: true; authInfo: AuthInfo; userId: string }
  | { ok: false; status: 401 | 403; error: string; description: string; scope?: string };

/**
 * Authenticates a request to the embedded MCP endpoint.
 *
 * Accepted credentials:
 * - OAuth access tokens issued by this deployment for the `/mcp` resource (primary).
 * - Self-hosted API keys (`umami_…`), so a remote MCP client can be configured without OAuth.
 *
 * Browser session tokens are deliberately rejected.
 */
export async function authenticateMcpRequest(request: Request): Promise<McpAuthResult> {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_request',
      description: 'Missing bearer token.',
    };
  }

  if (isApiKeyEnabled() && isApiKey(token)) {
    const auth = await checkApiKeyAuth(request, token);

    if (!auth?.user?.id) {
      return { ok: false, status: 401, error: 'invalid_token', description: 'Invalid API key.' };
    }

    return {
      ok: true,
      userId: auth.user.id,
      authInfo: {
        token,
        clientId: `api-key:${auth.apiKey.id}`,
        scopes: [...OAUTH_SCOPES],
        extra: { userId: auth.user.id, authType: 'api-key' },
      },
    };
  }

  if (!looksLikeAccessToken(token) || !isOAuthEnabled()) {
    return { ok: false, status: 401, error: 'invalid_token', description: 'Invalid bearer token.' };
  }

  const verified = verifyAccessToken(token);

  if (!verified) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_token',
      description: 'Access token is invalid or expired.',
    };
  }

  // Audience binding: the token must have been issued for this deployment's MCP resource.
  const endpoints = getOAuthEndpoints(request.headers);

  if (verified.resource !== endpoints.resource || verified.issuer !== getIssuer(request.headers)) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_token',
      description: 'Access token was not issued for this resource.',
    };
  }

  const auth = await buildOAuthAuth(token, verified);

  if (!auth) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_token',
      description: 'Access token is no longer valid.',
    };
  }

  return {
    ok: true,
    userId: auth.user.id,
    authInfo: {
      token,
      clientId: verified.clientId,
      scopes: verified.scopes,
      expiresAt: Math.floor(verified.expiresAt / 1000),
      resource: new URL(verified.resource),
      extra: { userId: auth.user.id, authType: 'oauth', tokenId: verified.tokenId },
    },
  };
}

export function mcpAuthErrorResponse(result: McpAuthResult, headers: Pick<Headers, 'get'>) {
  if (result.ok) {
    throw new Error('mcpAuthErrorResponse called with a successful result.');
  }

  // Explicit narrowing: the project compiles without strictNullChecks, so the guard above does
  // not narrow the union automatically.
  const failure = result as Extract<McpAuthResult, { ok: false }>;
  const endpoints = getOAuthEndpoints(headers);
  const parts = [
    `Bearer error="${failure.error}"`,
    `error_description="${failure.description.replace(/"/g, "'")}"`,
    `resource_metadata="${endpoints.protectedResourceMetadata}"`,
  ];

  if (failure.scope) {
    parts.push(`scope="${failure.scope}"`);
  } else if (failure.status === 401) {
    parts.push(`scope="${OAUTH_SCOPES.join(' ')}"`);
  }

  return Response.json(
    { error: failure.error, error_description: failure.description },
    {
      status: failure.status,
      headers: {
        'www-authenticate': parts.join(', '),
        'cache-control': 'no-store',
      },
    },
  );
}
