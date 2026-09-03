import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  consumeAuthorizationCode,
  createRefreshToken,
  getRefreshTokenByHash,
  revokeRefreshToken,
  revokeRefreshTokensForClient,
  touchRefreshToken,
} from '@/queries/prisma/oauth';
import { getUser } from '@/queries/prisma/user';
import { computeCodeChallenge } from './pkce';
import { handleRevocationRequest, handleTokenRequest } from './token';
import { generateRefreshToken, hashToken, verifyAccessToken } from './tokens';

vi.mock('@/queries/prisma/oauth', () => ({
  consumeAuthorizationCode: vi.fn(),
  createRefreshToken: vi.fn(),
  getRefreshTokenByHash: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeRefreshTokensForClient: vi.fn(),
  touchRefreshToken: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

const consumeAuthorizationCodeMock = vi.mocked(consumeAuthorizationCode);
const createRefreshTokenMock = vi.mocked(createRefreshToken);
const getRefreshTokenByHashMock = vi.mocked(getRefreshTokenByHash);
const revokeRefreshTokenMock = vi.mocked(revokeRefreshToken);
const revokeRefreshTokensForClientMock = vi.mocked(revokeRefreshTokensForClient);
const touchRefreshTokenMock = vi.mocked(touchRefreshToken);
const getUserMock = vi.mocked(getUser);

const ISSUER = 'https://analytics.example.com';
const RESOURCE = `${ISSUER}/mcp`;
const CLIENT_ID = 'https://app.example.com/client.json';
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const USER = { id: 'user-1', username: 'admin', role: 'admin', password: 'hashed' };

function codeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'code-1',
    codeHash: 'h',
    userId: USER.id,
    clientId: CLIENT_ID,
    redirectUri: 'https://app.example.com/cb',
    scope: 'analytics:read websites:read',
    resource: RESOURCE,
    codeChallenge: computeCodeChallenge(VERIFIER),
    codeChallengeMethod: 'S256',
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  } as never;
}

function grant(overrides: Record<string, unknown> = {}) {
  return {
    grant_type: 'authorization_code',
    code: 'the-code',
    client_id: CLIENT_ID,
    redirect_uri: 'https://app.example.com/cb',
    code_verifier: VERIFIER,
    resource: RESOURCE,
    ...overrides,
  };
}

beforeEach(() => {
  process.env.APP_SECRET = 'test';
  vi.mocked(consumeAuthorizationCodeMock).mockReset();
  createRefreshTokenMock.mockReset();
  createRefreshTokenMock.mockResolvedValue({} as never);
  getRefreshTokenByHashMock.mockReset();
  revokeRefreshTokenMock.mockReset();
  revokeRefreshTokenMock.mockResolvedValue(1);
  revokeRefreshTokensForClientMock.mockReset();
  touchRefreshTokenMock.mockReset();
  touchRefreshTokenMock.mockResolvedValue({} as never);
  getUserMock.mockReset();
  getUserMock.mockResolvedValue(USER as never);
});

describe('authorization_code grant', () => {
  test('issues access and refresh tokens', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: codeRecord(), replayed: null });

    const tokens = await handleTokenRequest(grant(), ISSUER);

    expect(tokens).toMatchObject({
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'analytics:read websites:read',
    });
    expect(tokens.refresh_token).toMatch(/^umami_rt_/);
    expect(verifyAccessToken(tokens.access_token)).toMatchObject({
      userId: USER.id,
      clientId: CLIENT_ID,
      resource: RESOURCE,
    });
    expect(createRefreshTokenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER.id,
        clientId: CLIENT_ID,
        tokenHash: hashToken(tokens.refresh_token),
      }),
    );
  });

  test('rejects an invalid PKCE verifier', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: codeRecord(), replayed: null });

    await expect(
      handleTokenRequest(grant({ code_verifier: `${VERIFIER.slice(0, -1)}x` }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_grant', message: /PKCE/ });
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  test('rejects client and redirect_uri mismatches', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: codeRecord(), replayed: null });
    await expect(
      handleTokenRequest(grant({ client_id: 'https://other.example/c.json' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_grant', message: /client_id/ });

    consumeAuthorizationCodeMock.mockResolvedValue({ code: codeRecord(), replayed: null });
    await expect(
      handleTokenRequest(grant({ redirect_uri: 'https://app.example.com/other' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_grant', message: /redirect_uri/ });
  });

  test('rejects expired or unknown codes', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: null, replayed: null });

    await expect(handleTokenRequest(grant(), ISSUER)).rejects.toMatchObject({
      code: 'invalid_grant',
    });
    expect(revokeRefreshTokensForClientMock).not.toHaveBeenCalled();
  });

  test('revokes the grant family when a code is replayed', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: null, replayed: codeRecord() });

    await expect(handleTokenRequest(grant(), ISSUER)).rejects.toMatchObject({
      code: 'invalid_grant',
    });
    expect(revokeRefreshTokensForClientMock).toHaveBeenCalledWith(USER.id, CLIENT_ID);
  });

  test('rejects a mismatched resource indicator', async () => {
    consumeAuthorizationCodeMock.mockResolvedValue({ code: codeRecord(), replayed: null });

    await expect(
      handleTokenRequest(grant({ resource: 'https://other.example/mcp' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_target' });
  });

  test('requires the required parameters', async () => {
    await expect(
      handleTokenRequest({ grant_type: 'authorization_code' }, ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_request' });
    await expect(handleTokenRequest({ grant_type: 'password' }, ISSUER)).rejects.toMatchObject({
      code: 'unsupported_grant_type',
    });
  });
});

describe('refresh_token grant', () => {
  function refreshRecord(overrides: Record<string, unknown> = {}) {
    return {
      id: 'rt-1',
      tokenHash: 'h',
      userId: USER.id,
      clientId: CLIENT_ID,
      scope: 'analytics:read websites:read',
      resource: RESOURCE,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      lastUsedAt: null,
      createdAt: new Date(),
      ...overrides,
    } as never;
  }

  test('rotates the refresh token', async () => {
    const presented = generateRefreshToken();
    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord());

    const tokens = await handleTokenRequest(
      { grant_type: 'refresh_token', refresh_token: presented, client_id: CLIENT_ID },
      ISSUER,
    );

    expect(getRefreshTokenByHashMock).toHaveBeenCalledWith(hashToken(presented));
    expect(revokeRefreshTokenMock).toHaveBeenCalledWith('rt-1');
    expect(tokens.refresh_token).not.toBe(presented);
    expect(tokens.scope).toBe('analytics:read websites:read');
  });

  test('allows narrowing but not widening scope', async () => {
    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord({ scope: 'websites:read' }));

    await expect(
      handleTokenRequest(
        {
          grant_type: 'refresh_token',
          refresh_token: generateRefreshToken(),
          scope: 'analytics:read',
        },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_scope' });

    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord());
    const narrowed = await handleTokenRequest(
      {
        grant_type: 'refresh_token',
        refresh_token: generateRefreshToken(),
        scope: 'websites:read',
      },
      ISSUER,
    );

    expect(narrowed.scope).toBe('websites:read');
  });

  test('rejects revoked, expired, unknown and concurrently-used tokens', async () => {
    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord({ revokedAt: new Date() }));
    await expect(
      handleTokenRequest(
        { grant_type: 'refresh_token', refresh_token: generateRefreshToken() },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_grant' });

    getRefreshTokenByHashMock.mockResolvedValue(
      refreshRecord({ expiresAt: new Date(Date.now() - 1) }),
    );
    await expect(
      handleTokenRequest(
        { grant_type: 'refresh_token', refresh_token: generateRefreshToken() },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_grant' });

    getRefreshTokenByHashMock.mockResolvedValue(null);
    await expect(
      handleTokenRequest(
        { grant_type: 'refresh_token', refresh_token: generateRefreshToken() },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_grant' });

    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord());
    revokeRefreshTokenMock.mockResolvedValue(0);
    await expect(
      handleTokenRequest(
        { grant_type: 'refresh_token', refresh_token: generateRefreshToken() },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_grant', message: /already been used/ });
  });

  test('rejects a client mismatch', async () => {
    getRefreshTokenByHashMock.mockResolvedValue(refreshRecord());

    await expect(
      handleTokenRequest(
        { grant_type: 'refresh_token', refresh_token: generateRefreshToken(), client_id: 'other' },
        ISSUER,
      ),
    ).rejects.toMatchObject({ code: 'invalid_grant' });
  });
});

describe('revocation', () => {
  test('revokes known refresh tokens and ignores everything else', async () => {
    getRefreshTokenByHashMock.mockResolvedValue({ id: 'rt-1', revokedAt: null } as never);
    await handleRevocationRequest({ token: generateRefreshToken() });
    expect(revokeRefreshTokenMock).toHaveBeenCalledWith('rt-1');

    revokeRefreshTokenMock.mockClear();
    await handleRevocationRequest({ token: 'not-a-refresh-token' });
    await handleRevocationRequest({ token: undefined });
    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
  });
});
