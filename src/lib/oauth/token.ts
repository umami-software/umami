import { uuid } from '@/lib/crypto';
import { getMcpResource, normalizeResource, REFRESH_TOKEN_TTL_SECONDS } from '@/lib/oauth/config';
import { OAuthError } from '@/lib/oauth/errors';
import { verifyPkce } from '@/lib/oauth/pkce';
import { normalizeScopes, parseScopes } from '@/lib/oauth/scopes';
import {
  createAccessToken,
  generateRefreshToken,
  hashToken,
  isRefreshToken,
} from '@/lib/oauth/tokens';
import {
  consumeAuthorizationCode,
  createRefreshToken,
  getRefreshTokenByHash,
  revokeRefreshToken,
  revokeRefreshTokensForClient,
  touchRefreshToken,
} from '@/queries/prisma/oauth';
import { getUser } from '@/queries/prisma/user';

export interface TokenRequestParams {
  grant_type?: unknown;
  code?: unknown;
  redirect_uri?: unknown;
  client_id?: unknown;
  code_verifier?: unknown;
  refresh_token?: unknown;
  scope?: unknown;
  resource?: unknown;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}

function requireString(value: unknown, name: string, max = 4096) {
  if (typeof value !== 'string' || !value || value.length > max) {
    throw new OAuthError('invalid_request', `${name} is required.`);
  }

  return value;
}

async function loadUser(userId: string) {
  const user = (await getUser(userId, { includePassword: true })) as {
    id: string;
    password?: string;
    deletedAt?: Date | null;
  } | null;

  if (!user?.id || user.deletedAt) {
    throw new OAuthError('invalid_grant', 'The user account is no longer available.');
  }

  return user;
}

async function issueTokens(options: {
  userId: string;
  clientId: string;
  scopes: string[];
  resource: string;
  issuer: string;
  passwordHash?: string;
}): Promise<TokenResponse> {
  const scopes = normalizeScopes(options.scopes);
  const access = createAccessToken({
    userId: options.userId,
    clientId: options.clientId,
    scopes,
    issuer: options.issuer,
    resource: options.resource,
    passwordHash: options.passwordHash,
  });
  const refreshToken = generateRefreshToken();

  await createRefreshToken({
    id: uuid(),
    tokenHash: hashToken(refreshToken),
    userId: options.userId,
    clientId: options.clientId,
    scope: scopes.join(' '),
    resource: options.resource,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
  });

  return {
    access_token: access.token,
    token_type: 'Bearer',
    expires_in: access.expiresIn,
    refresh_token: refreshToken,
    scope: scopes.join(' '),
  };
}

export async function handleAuthorizationCodeGrant(
  params: TokenRequestParams,
  issuer: string,
): Promise<TokenResponse> {
  const code = requireString(params.code, 'code', 512);
  const clientId = requireString(params.client_id, 'client_id', 2048);
  const codeVerifier = requireString(params.code_verifier, 'code_verifier', 128);
  const { code: record, replayed } = await consumeAuthorizationCode(hashToken(code));

  if (!record) {
    if (replayed) {
      // Replay of a redeemed code: revoke everything that code produced (OAuth 2.1 §4.1.2).
      await revokeRefreshTokensForClient(replayed.userId, replayed.clientId);
    }

    throw new OAuthError(
      'invalid_grant',
      'Authorization code is invalid, expired or already used.',
    );
  }

  if (record.clientId !== clientId) {
    throw new OAuthError('invalid_grant', 'client_id does not match the authorization code.');
  }

  const redirectUri = typeof params.redirect_uri === 'string' ? params.redirect_uri : undefined;

  if (redirectUri !== undefined && redirectUri !== record.redirectUri) {
    throw new OAuthError('invalid_grant', 'redirect_uri does not match the authorization request.');
  }

  if (!verifyPkce(codeVerifier, record.codeChallenge, record.codeChallengeMethod)) {
    throw new OAuthError('invalid_grant', 'PKCE verification failed.');
  }

  const expectedResource = record.resource ?? getMcpResource(issuer);
  const resourceParam =
    typeof params.resource === 'string' ? normalizeResource(params.resource) : null;

  if (params.resource !== undefined && resourceParam !== expectedResource) {
    throw new OAuthError('invalid_target', `resource must be ${expectedResource}.`);
  }

  const user = await loadUser(record.userId);

  return issueTokens({
    userId: user.id,
    clientId: record.clientId,
    scopes: parseScopes(record.scope),
    resource: expectedResource,
    issuer,
    passwordHash: user.password,
  });
}

export async function handleRefreshTokenGrant(
  params: TokenRequestParams,
  issuer: string,
): Promise<TokenResponse> {
  const refreshToken = requireString(params.refresh_token, 'refresh_token', 512);

  if (!isRefreshToken(refreshToken)) {
    throw new OAuthError('invalid_grant', 'Refresh token is invalid.');
  }

  const record = await getRefreshTokenByHash(hashToken(refreshToken));

  if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
    throw new OAuthError('invalid_grant', 'Refresh token is invalid, expired or revoked.');
  }

  if (params.client_id !== undefined && params.client_id !== record.clientId) {
    throw new OAuthError('invalid_grant', 'client_id does not match the refresh token.');
  }

  const grantedScopes = normalizeScopes(parseScopes(record.scope));
  const requestedScopes = typeof params.scope === 'string' ? parseScopes(params.scope) : [];
  const narrowed = requestedScopes.length ? normalizeScopes(requestedScopes) : grantedScopes;

  if (narrowed.some(scope => !grantedScopes.includes(scope))) {
    throw new OAuthError('invalid_scope', 'Requested scope exceeds the granted scope.');
  }

  const expectedResource = record.resource ?? getMcpResource(issuer);

  if (params.resource !== undefined) {
    const resourceParam =
      typeof params.resource === 'string' ? normalizeResource(params.resource) : null;

    if (resourceParam !== expectedResource) {
      throw new OAuthError('invalid_target', `resource must be ${expectedResource}.`);
    }
  }

  const user = await loadUser(record.userId);

  // Rotate: the presented refresh token is retired and a new one issued (OAuth 2.1 §4.3.1).
  const revoked = await revokeRefreshToken(record.id);

  if (!revoked) {
    throw new OAuthError('invalid_grant', 'Refresh token has already been used.');
  }

  await touchRefreshToken(record.id);

  return issueTokens({
    userId: user.id,
    clientId: record.clientId,
    scopes: narrowed,
    resource: expectedResource,
    issuer,
    passwordHash: user.password,
  });
}

export async function handleTokenRequest(params: TokenRequestParams, issuer: string) {
  switch (params.grant_type) {
    case 'authorization_code':
      return handleAuthorizationCodeGrant(params, issuer);
    case 'refresh_token':
      return handleRefreshTokenGrant(params, issuer);
    default:
      throw new OAuthError(
        'unsupported_grant_type',
        'grant_type must be "authorization_code" or "refresh_token".',
      );
  }
}

export async function handleRevocationRequest(params: { token?: unknown }) {
  // RFC 7009: unknown tokens are silently accepted. Only refresh tokens are revocable;
  // access tokens are short-lived and expire on their own.
  if (isRefreshToken(params.token)) {
    const record = await getRefreshTokenByHash(hashToken(params.token));

    if (record && !record.revokedAt) {
      await revokeRefreshToken(record.id);
    }
  }
}
