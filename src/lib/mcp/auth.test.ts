import { beforeEach, describe, expect, test, vi } from 'vitest';
import { checkApiKeyAuth } from '@/lib/auth';
import { authenticateMcpRequest, mcpAuthErrorResponse } from './auth';

vi.mock('@/lib/auth', () => ({
  getBearerToken: (request: Request) => request.headers.get('authorization')?.split(' ')[1],
  checkApiKeyAuth: vi.fn(),
}));

const checkApiKeyAuthMock = vi.mocked(checkApiKeyAuth);

function request(token?: string) {
  return new Request('https://analytics.example.com/mcp', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  checkApiKeyAuthMock.mockReset();
});

describe('authenticateMcpRequest', () => {
  test('rejects missing tokens with an API key challenge', async () => {
    const result = await authenticateMcpRequest(request());
    const response = mcpAuthErrorResponse(result);

    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toBe(
      'Bearer realm="Umami MCP", error="invalid_request"',
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  test.each(['not-a-token', 'eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoib2F1dGhfYWNjZXNzIn0.signature'])(
    'rejects non-API-key credentials: %s',
    async token => {
      await expect(authenticateMcpRequest(request(token))).resolves.toMatchObject({
        ok: false,
        status: 401,
      });
      expect(checkApiKeyAuthMock).not.toHaveBeenCalled();
    },
  );

  test('accepts self-hosted API keys and preserves owner identity', async () => {
    checkApiKeyAuthMock.mockResolvedValue({
      token: 'umami_key',
      user: { id: 'user-1' },
      apiKey: { id: 'key-1', name: 'MCP' },
    } as never);

    await expect(authenticateMcpRequest(request('umami_key'))).resolves.toMatchObject({
      ok: true,
      userId: 'user-1',
      authInfo: {
        token: 'umami_key',
        clientId: 'api-key:key-1',
        scopes: [],
        extra: { userId: 'user-1', authType: 'api-key' },
      },
    });
  });

  test('rejects revoked or unknown keys', async () => {
    checkApiKeyAuthMock.mockResolvedValue(null);
    await expect(authenticateMcpRequest(request('umami_revoked'))).resolves.toMatchObject({
      ok: false,
      status: 401,
      error: 'invalid_token',
    });
  });

  test('rejects self-hosted keys in Cloud mode', async () => {
    vi.stubEnv('CLOUD_MODE', '1');
    await expect(authenticateMcpRequest(request('umami_key'))).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
    expect(checkApiKeyAuthMock).not.toHaveBeenCalled();
  });
});
