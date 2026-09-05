import { beforeEach, describe, expect, test, vi } from 'vitest';
import { hash } from '@/lib/crypto';
import { getUser } from '@/queries/prisma/user';
import { createAccessToken } from './tokens';
import { verifyOAuthRequest } from './verify';

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

const getUserMock = vi.mocked(getUser);
const ISSUER = 'https://analytics.example.com';
const USER = { id: 'user-1', username: 'admin', role: 'user', password: 'pw-hash' };

function token(scopes: string[], overrides: Record<string, unknown> = {}) {
  return createAccessToken({
    userId: USER.id,
    clientId: 'https://app.example.com/client.json',
    scopes,
    issuer: ISSUER,
    resource: `${ISSUER}/mcp`,
    passwordHash: USER.password,
    ...overrides,
  }).token;
}

beforeEach(() => {
  process.env.APP_SECRET = 'test';
  delete process.env.OAUTH_DISABLED;
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ ...USER } as never);
});

describe('verifyOAuthRequest', () => {
  test('ignores non-OAuth tokens', async () => {
    await expect(verifyOAuthRequest('umami_key', 'GET', '/api/websites')).resolves.toEqual({
      status: 'not-oauth',
    });
    await expect(verifyOAuthRequest(undefined, 'GET', '/api/websites')).resolves.toEqual({
      status: 'not-oauth',
    });
  });

  test('builds an OAuth auth context on an allowlisted route', async () => {
    const result = await verifyOAuthRequest(
      token(['websites:read', 'analytics:read']),
      'GET',
      '/api/websites/abc/stats',
    );

    expect(result.status).toBe('ok');

    if (result.status === 'ok') {
      expect(result.auth.user).toMatchObject({ id: USER.id, isAdmin: false });
      expect(result.auth.user).not.toHaveProperty('password');
      expect(result.auth.authType).toBe('oauth');
      expect(result.auth.oauth).toMatchObject({
        clientId: 'https://app.example.com/client.json',
        scopes: ['analytics:read', 'websites:read'],
      });
    }
  });

  test('rejects routes that did not opt in to OAuth', async () => {
    await expect(
      verifyOAuthRequest(token(['websites:read', 'analytics:read']), 'POST', '/api/websites'),
    ).resolves.toMatchObject({ status: 'forbidden', reason: 'route-not-allowed' });
    await expect(
      verifyOAuthRequest(token(['websites:read', 'analytics:read']), 'GET', '/api/me/api-keys'),
    ).resolves.toMatchObject({ status: 'forbidden', reason: 'route-not-allowed' });
    await expect(
      verifyOAuthRequest(token(['websites:read', 'analytics:read']), 'DELETE', '/api/websites/abc'),
    ).resolves.toMatchObject({ status: 'forbidden' });
  });

  test('rejects insufficient scope', async () => {
    await expect(
      verifyOAuthRequest(token(['websites:read']), 'GET', '/api/websites/abc/stats'),
    ).resolves.toMatchObject({
      status: 'forbidden',
      reason: 'insufficient-scope',
      requiredScope: 'analytics:read',
    });
  });

  test('rejects tokens after a password change or when the user is gone', async () => {
    getUserMock.mockResolvedValue({ ...USER, password: 'changed' } as never);
    await expect(
      verifyOAuthRequest(token(['websites:read']), 'GET', '/api/websites'),
    ).resolves.toEqual({ status: 'invalid' });

    getUserMock.mockResolvedValue(null as never);
    await expect(
      verifyOAuthRequest(token(['websites:read']), 'GET', '/api/websites'),
    ).resolves.toEqual({ status: 'invalid' });
  });

  test('rejects everything when OAuth is disabled', async () => {
    process.env.OAUTH_DISABLED = '1';

    await expect(
      verifyOAuthRequest(token(['websites:read']), 'GET', '/api/websites'),
    ).resolves.toEqual({ status: 'invalid' });
  });

  test('password fingerprint uses the hashed password', () => {
    expect(hash('pw-hash')).not.toBe('pw-hash');
  });
});
