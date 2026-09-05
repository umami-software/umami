import { beforeEach, describe, expect, test, vi } from 'vitest';
import { checkApiKeyAuth } from '@/lib/auth';
import { createAccessToken } from '@/lib/oauth/tokens';
import { getUser } from '@/queries/prisma/user';
import { authenticateMcpRequest, mcpAuthErrorResponse } from './auth';

vi.mock('@/lib/auth', () => ({
  getBearerToken: (request: Request) => request.headers.get('authorization')?.split(' ')[1],
  checkApiKeyAuth: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

const checkApiKeyAuthMock = vi.mocked(checkApiKeyAuth);
const getUserMock = vi.mocked(getUser);
const ISSUER = 'https://analytics.example.com';
const USER = { id: 'user-1', username: 'admin', role: 'user', password: 'pw' };

function request(token?: string) {
  return new Request(`${ISSUER}/mcp`, {
    method: 'POST',
    headers: {
      host: 'analytics.example.com',
      'x-forwarded-proto': 'https',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
}

function accessToken(overrides: Record<string, unknown> = {}) {
  return createAccessToken({
    userId: USER.id,
    clientId: 'https://app.example.com/client.json',
    scopes: ['websites:read', 'analytics:read'],
    issuer: ISSUER,
    resource: `${ISSUER}/mcp`,
    passwordHash: USER.password,
    ...overrides,
  }).token;
}

beforeEach(() => {
  process.env.APP_SECRET = 'test';
  delete process.env.OAUTH_ISSUER;
  delete process.env.CLOUD_MODE;
  checkApiKeyAuthMock.mockReset();
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ ...USER } as never);
});

describe('authenticateMcpRequest', () => {
  test('rejects missing tokens with a resource metadata challenge', async () => {
    const result = await authenticateMcpRequest(request());

    expect(result.ok).toBe(false);

    const response = mcpAuthErrorResponse(result as never, request().headers);

    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain(
      `resource_metadata="${ISSUER}/.well-known/oauth-protected-resource/mcp"`,
    );
    expect(response.headers.get('www-authenticate')).toContain(
      'scope="websites:read analytics:read"',
    );
  });

  test('accepts OAuth access tokens issued for this resource', async () => {
    const result = await authenticateMcpRequest(request(accessToken()));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.userId).toBe(USER.id);
      expect(result.authInfo).toMatchObject({
        clientId: 'https://app.example.com/client.json',
        scopes: ['analytics:read', 'websites:read'],
      });
      expect(result.authInfo.extra).toMatchObject({ userId: USER.id, authType: 'oauth' });
    }
  });

  test('rejects tokens issued for another deployment', async () => {
    const foreign = createAccessToken({
      userId: USER.id,
      clientId: 'c',
      scopes: ['websites:read'],
      issuer: 'https://other.example.com',
      resource: 'https://other.example.com/mcp',
    }).token;

    const result = await authenticateMcpRequest(request(foreign));

    expect(result).toMatchObject({ ok: false, status: 401, error: 'invalid_token' });
  });

  test('rejects session tokens and garbage', async () => {
    await expect(authenticateMcpRequest(request('not-a-token'))).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
  });

  test('accepts self-hosted API keys', async () => {
    checkApiKeyAuthMock.mockResolvedValue({
      token: 'umami_key',
      user: { id: USER.id, username: 'admin', role: 'user', isAdmin: false },
      authType: 'api-key',
      apiKey: { id: 'key-1', name: 'MCP' },
    } as never);

    const result = await authenticateMcpRequest(request('umami_key'));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.authInfo.clientId).toBe('api-key:key-1');
      expect(result.authInfo.scopes).toEqual(['websites:read', 'analytics:read']);
    }
  });
});
