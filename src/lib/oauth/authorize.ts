import { uuid } from '@/lib/crypto';
import {
  type MetadataFetch,
  type ResolvedOAuthClient,
  resolveOAuthClient,
} from '@/lib/oauth/client';
import {
  AUTHORIZATION_CODE_TTL_SECONDS,
  getMcpResource,
  normalizeResource,
} from '@/lib/oauth/config';
import { OAuthError } from '@/lib/oauth/errors';
import { isPkceMethod, isValidCodeChallenge } from '@/lib/oauth/pkce';
import { appendRedirectParams, findMatchingRedirectUri } from '@/lib/oauth/redirect';
import {
  isOAuthScope,
  normalizeScopes,
  OAUTH_SCOPES,
  type OAuthScope,
  parseScopes,
} from '@/lib/oauth/scopes';
import { generateAuthorizationCode, hashToken } from '@/lib/oauth/tokens';
import { createAuthorizationCode } from '@/queries/prisma/oauth';

export interface AuthorizationRequestParams {
  response_type?: unknown;
  client_id?: unknown;
  redirect_uri?: unknown;
  scope?: unknown;
  state?: unknown;
  code_challenge?: unknown;
  code_challenge_method?: unknown;
  resource?: unknown;
}

export interface ValidatedAuthorizationRequest {
  client: ResolvedOAuthClient;
  redirectUri: string;
  scopes: OAuthScope[];
  state?: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  resource: string;
}

function optionalString(value: unknown, name: string, max = 2048) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string' || value.length > max) {
    throw new OAuthError('invalid_request', `${name} is invalid.`);
  }

  return value;
}

/**
 * Validates an authorization request per OAuth 2.1 + MCP requirements: PKCE S256 is mandatory,
 * the redirect URI must be registered, scopes must be known, and the resource indicator must be
 * this deployment's MCP server.
 *
 * Errors thrown before the redirect URI is validated must be shown to the user; errors thrown
 * afterwards are marked `redirectable`.
 */
export async function validateAuthorizationRequest(
  params: AuthorizationRequestParams,
  issuer: string,
  options: { fetch?: MetadataFetch } = {},
): Promise<ValidatedAuthorizationRequest> {
  const client = await resolveOAuthClient(params.client_id, options);
  const redirectUriParam = optionalString(params.redirect_uri, 'redirect_uri');
  const redirectUri = redirectUriParam
    ? findMatchingRedirectUri(redirectUriParam, client.redirectUris)
    : client.redirectUris.length === 1
      ? client.redirectUris[0]
      : null;

  if (!redirectUri) {
    throw new OAuthError('invalid_redirect_uri', 'redirect_uri is not registered for this client.');
  }

  const redirectable = { redirectable: true };

  if (params.response_type !== 'code') {
    throw new OAuthError(
      'unsupported_response_type',
      'response_type must be "code".',
      redirectable,
    );
  }

  if (!isValidCodeChallenge(params.code_challenge)) {
    throw new OAuthError(
      'invalid_request',
      'A PKCE code_challenge (S256) is required.',
      redirectable,
    );
  }

  if (!isPkceMethod(params.code_challenge_method)) {
    throw new OAuthError('invalid_request', 'code_challenge_method must be "S256".', redirectable);
  }

  const requestedScopes = parseScopes(optionalString(params.scope, 'scope', 500));
  const unknown = requestedScopes.filter(
    scope => !isOAuthScope(scope) && scope !== 'offline_access',
  );

  if (unknown.length) {
    throw new OAuthError('invalid_scope', `Unknown scope: ${unknown.join(', ')}.`, redirectable);
  }

  const scopes = requestedScopes.length
    ? normalizeScopes(requestedScopes)
    : normalizeScopes([...OAUTH_SCOPES]);

  if (!scopes.length) {
    throw new OAuthError('invalid_scope', 'At least one scope is required.', redirectable);
  }

  const expectedResource = getMcpResource(issuer);
  const resourceParam = optionalString(params.resource, 'resource');
  const resource = resourceParam ? normalizeResource(resourceParam) : expectedResource;

  if (!resource || resource !== expectedResource) {
    throw new OAuthError('invalid_target', `resource must be ${expectedResource}.`, redirectable);
  }

  return {
    client,
    redirectUri,
    scopes,
    state: optionalString(params.state, 'state', 1024),
    codeChallenge: params.code_challenge,
    codeChallengeMethod: 'S256',
    resource,
  };
}

export async function issueAuthorizationCode(
  request: ValidatedAuthorizationRequest,
  userId: string,
) {
  const code = generateAuthorizationCode();

  await createAuthorizationCode({
    id: uuid(),
    codeHash: hashToken(code),
    userId,
    clientId: request.client.clientId,
    redirectUri: request.redirectUri,
    scope: request.scopes.join(' '),
    resource: request.resource,
    codeChallenge: request.codeChallenge,
    codeChallengeMethod: request.codeChallengeMethod,
    expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_SECONDS * 1000),
  });

  return code;
}

export function buildSuccessRedirect(
  request: Pick<ValidatedAuthorizationRequest, 'redirectUri' | 'state'>,
  code: string,
  issuer: string,
) {
  return appendRedirectParams(request.redirectUri, { code, state: request.state, iss: issuer });
}

export function buildErrorRedirect(
  redirectUri: string,
  error: OAuthError,
  state: string | undefined,
  issuer: string,
) {
  return appendRedirectParams(redirectUri, {
    error: error.code,
    error_description: error.message,
    state,
    iss: issuer,
  });
}
