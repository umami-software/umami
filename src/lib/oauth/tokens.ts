import { hash, secret, uuid } from '@/lib/crypto';
import { createToken, parseToken } from '@/lib/jwt';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  getMcpResource,
  OAUTH_ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_PREFIX,
} from '@/lib/oauth/config';
import { generateSecret } from '@/lib/oauth/pkce';
import { normalizeScopes, type OAuthScope } from '@/lib/oauth/scopes';

export interface AccessTokenClaims {
  /** User ID. */
  sub: string;
  iss: string;
  aud: string;
  client_id: string;
  scope: string;
  type: typeof OAUTH_ACCESS_TOKEN_TYPE;
  jti: string;
  /** Password fingerprint so that a password change invalidates outstanding tokens. */
  pwd?: string;
  iat: number;
  exp: number;
}

export interface CreateAccessTokenOptions {
  userId: string;
  clientId: string;
  scopes: readonly string[];
  issuer: string;
  resource: string;
  passwordHash?: string;
  expiresInSeconds?: number;
}

export function createAccessToken(options: CreateAccessTokenOptions) {
  const expiresIn = options.expiresInSeconds ?? ACCESS_TOKEN_TTL_SECONDS;
  const jti = uuid();
  const token = createToken(
    {
      sub: options.userId,
      iss: options.issuer,
      aud: options.resource,
      client_id: options.clientId,
      scope: normalizeScopes([...options.scopes]).join(' '),
      type: OAUTH_ACCESS_TOKEN_TYPE,
      jti,
      ...(options.passwordHash ? { pwd: hash(options.passwordHash) } : {}),
    },
    secret(),
    { expiresIn },
  ) as string;

  return { token, jti, expiresIn };
}

export interface VerifiedAccessToken {
  userId: string;
  clientId: string;
  scopes: OAuthScope[];
  issuer: string;
  resource: string;
  tokenId: string;
  passwordFingerprint?: string;
  expiresAt: number;
}

/**
 * Cheap structural check so that ordinary session tokens (encrypted, not plain JWTs) and API
 * keys can skip OAuth verification entirely.
 */
export function looksLikeAccessToken(token?: string | null): token is string {
  if (!token || token.split('.').length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));

    return payload?.type === OAUTH_ACCESS_TOKEN_TYPE;
  } catch {
    return false;
  }
}

/**
 * Verifies signature, expiry, token type and audience binding. The audience must be the MCP
 * resource of the issuer that minted the token, so a token can never be replayed against a
 * different Umami deployment sharing the same secret.
 */
export function verifyAccessToken(token: string): VerifiedAccessToken | null {
  const payload = parseToken(token, secret()) as Partial<AccessTokenClaims> | null;

  if (
    !payload ||
    payload.type !== OAUTH_ACCESS_TOKEN_TYPE ||
    typeof payload.sub !== 'string' ||
    typeof payload.client_id !== 'string' ||
    typeof payload.iss !== 'string' ||
    typeof payload.aud !== 'string' ||
    typeof payload.jti !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  if (payload.aud !== getMcpResource(payload.iss)) {
    return null;
  }

  return {
    userId: payload.sub,
    clientId: payload.client_id,
    scopes: normalizeScopes((payload.scope ?? '').split(' ')),
    issuer: payload.iss,
    resource: payload.aud,
    tokenId: payload.jti,
    passwordFingerprint: payload.pwd,
    expiresAt: payload.exp * 1000,
  };
}

export function generateRefreshToken() {
  return `${REFRESH_TOKEN_PREFIX}${generateSecret(32)}`;
}

export function isRefreshToken(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(REFRESH_TOKEN_PREFIX);
}

export function hashToken(value: string) {
  return hash(value);
}

export function generateAuthorizationCode() {
  return generateSecret(32);
}
