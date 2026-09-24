import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AUTH_SESSION_TTL } from '@/lib/constants';
import { hash } from '@/lib/crypto';
import { parseSecureToken, parseToken } from '@/lib/jwt';
import redis from '@/lib/redis';
import { getApiKeyByHash, updateApiKeyLastUsed } from '@/queries/prisma/apiKey';
import { getShare } from '@/queries/prisma/share';
import { getUser } from '@/queries/prisma/user';
import { hashApiKey } from './api-key';
import { checkAuth } from './auth';

vi.hoisted(() => {
  process.env.APP_SECRET ??= 'test-app-secret';
});

vi.mock('@/lib/jwt', () => ({
  parseSecureToken: vi.fn(),
  parseToken: vi.fn(() => null),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/queries/prisma/share', () => ({
  getShare: vi.fn(),
}));

vi.mock('@/queries/prisma/apiKey', () => ({
  getApiKeyByHash: vi.fn(),
  updateApiKeyLastUsed: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
    client: {
      get: vi.fn(),
      expire: vi.fn().mockResolvedValue(true),
    },
  },
}));

const parseSecureTokenMock = vi.mocked(parseSecureToken);
const parseTokenMock = vi.mocked(parseToken);
const getShareMock = vi.mocked(getShare);
const getUserMock = vi.mocked(getUser);
const getApiKeyByHashMock = vi.mocked(getApiKeyByHash);
const updateApiKeyLastUsedMock = vi.mocked(updateApiKeyLastUsed);
const redisMock = redis as unknown as {
  enabled: boolean;
  client: {
    get: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
  };
};

const PASSWORD_HASH = '$2b$10$currentpasswordhashvalue';

function authedRequest() {
  return new Request('http://localhost/api/test', {
    headers: { authorization: 'Bearer secure-token' },
  });
}

function mockUser() {
  getUserMock.mockResolvedValue({
    id: 'user-1',
    username: 'bob',
    role: 'user',
    password: PASSWORD_HASH,
  } as any);
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  parseSecureTokenMock.mockReset();
  parseTokenMock.mockReset();
  parseTokenMock.mockReturnValue(null);
  getShareMock.mockReset();
  getUserMock.mockReset();
  getApiKeyByHashMock.mockReset();
  updateApiKeyLastUsedMock.mockClear();
  redisMock.enabled = false;
  redisMock.client.get.mockReset();
  redisMock.client.expire.mockReset();
  redisMock.client.expire.mockResolvedValue(true);
});

describe('checkAuth api keys', () => {
  const API_KEY = 'umami_abcdefghijklmnopqrstuvwxyz012345';

  function apiKeyRequest(path = '/api/websites') {
    return new Request(`http://localhost${path}`, {
      headers: { authorization: `Bearer ${API_KEY}` },
    });
  }

  function mockApiKey(lastUsedAt: Date | null = null) {
    getApiKeyByHashMock.mockResolvedValue({
      id: 'key-1',
      userId: 'user-1',
      name: 'CI',
      keyHash: hashApiKey(API_KEY),
      keyPrefix: 'umami_abcdefgh',
      lastUsedAt,
      createdAt: new Date(),
    } as any);
  }

  test('authorizes a valid api key and looks it up by hash', async () => {
    mockApiKey();
    mockUser();

    const result: any = await checkAuth(apiKeyRequest());

    expect(getApiKeyByHashMock).toHaveBeenCalledWith(hashApiKey(API_KEY));
    expect(result?.user?.id).toBe('user-1');
    expect(result?.user).not.toHaveProperty('password');
    expect(result?.apiKey).toEqual({ id: 'key-1', name: 'CI' });
    expect(parseSecureTokenMock).not.toHaveBeenCalled();
  });

  test('rejects an unknown api key', async () => {
    getApiKeyByHashMock.mockResolvedValue(null);

    const result = await checkAuth(apiKeyRequest());

    expect(result).toBeNull();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  test('rejects an api key whose user no longer exists', async () => {
    mockApiKey();
    getUserMock.mockResolvedValue(null as any);

    const result = await checkAuth(apiKeyRequest());

    expect(result).toBeNull();
  });

  test('rejects api keys on sensitive routes', async () => {
    mockApiKey();
    mockUser();

    for (const path of [
      '/api/me/password',
      '/api/me/api-keys',
      '/api/me/api-keys/key-1',
      '/api/2fa/status',
      '/api/auth/logout',
      '/api/users',
      '/api/admin/users',
    ]) {
      expect(await checkAuth(apiKeyRequest(path))).toBeNull();
    }

    expect(getApiKeyByHashMock).not.toHaveBeenCalled();
  });

  test('ignores api keys in cloud mode', async () => {
    vi.stubEnv('CLOUD_MODE', '1');
    mockApiKey();
    mockUser();
    parseSecureTokenMock.mockReturnValue(null);

    const result = await checkAuth(apiKeyRequest());

    expect(result).toBeNull();
    expect(getApiKeyByHashMock).not.toHaveBeenCalled();
    expect(parseSecureTokenMock).toHaveBeenCalled();
  });

  test('updates lastUsedAt when stale', async () => {
    mockApiKey(new Date(Date.now() - 60 * 60 * 1000));
    mockUser();

    await checkAuth(apiKeyRequest());

    expect(updateApiKeyLastUsedMock).toHaveBeenCalledWith('key-1');
  });

  test('does not update lastUsedAt when recently used', async () => {
    mockApiKey(new Date());
    mockUser();

    await checkAuth(apiKeyRequest());

    expect(updateApiKeyLastUsedMock).not.toHaveBeenCalled();
  });

  test('does not treat a jwt as an api key', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1' } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
    expect(getApiKeyByHashMock).not.toHaveBeenCalled();
  });
});

describe('checkAuth 2FA partial token', () => {
  // GHSA-vj8c-fvjv-rpg2: the partial token issued after the password step of a
  // 2FA login must not be usable as a session on protected routes.
  test('rejects a partial-auth token on a protected route', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', type: 'partial-auth' } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result).toBeNull();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  test('rejects a partial-auth token even when it carries a matching password fingerprint', async () => {
    parseSecureTokenMock.mockReturnValue({
      userId: 'user-1',
      type: 'partial-auth',
      pwd: hash(PASSWORD_HASH),
    } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result).toBeNull();
  });

  test('rejects a partial-auth token in Redis mode', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', type: 'partial-auth' } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result).toBeNull();
    expect(redisMock.client.get).not.toHaveBeenCalled();
  });
});

describe('checkAuth password fingerprint', () => {
  test('authorizes a stateless token whose fingerprint matches the current password', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', pwd: hash(PASSWORD_HASH) } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
  });

  test('authorizes a legacy stateless token that does not include a password fingerprint', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1' } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
  });

  test('rejects a stateless token whose fingerprint predates a password change', async () => {
    // Token minted against the old password must stop working once the password changes.
    parseSecureTokenMock.mockReturnValue({
      userId: 'user-1',
      pwd: hash('old-password-hash'),
    } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result).toBeNull();
  });

  test('does not expose the password hash on the returned user', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', pwd: hash(PASSWORD_HASH) } as any);
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user).not.toHaveProperty('password');
  });

  test('authorizes a Redis session whose fingerprint matches the current password', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({ userId: 'user-1', pwd: hash(PASSWORD_HASH) });
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
  });

  test('rejects a Redis session whose fingerprint predates a password change', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({ userId: 'user-1', pwd: hash('old-password-hash') });
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result).toBeNull();
  });

  test('refreshes the session TTL so an active user is not signed out', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({
      userId: 'user-1',
      pwd: hash(PASSWORD_HASH),
      ttl: AUTH_SESSION_TTL,
    });
    mockUser();

    await checkAuth(authedRequest());

    expect(redisMock.client.expire).toHaveBeenCalledWith('auth:session-key', AUTH_SESSION_TTL);
  });

  test('leaves a session stored without a window at its original expiry', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({ userId: 'user-1', pwd: hash(PASSWORD_HASH) });
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
    expect(redisMock.client.expire).not.toHaveBeenCalled();
  });

  test('refreshes using the window the session was created with', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({
      userId: 'user-1',
      pwd: hash(PASSWORD_HASH),
      ttl: 86400,
    });
    mockUser();

    await checkAuth(authedRequest());

    expect(redisMock.client.expire).toHaveBeenCalledWith('auth:session-key', 86400);
  });

  test('does not refresh the TTL of a session rejected by a password change', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({ userId: 'user-1', pwd: hash('old-password-hash') });
    mockUser();

    await checkAuth(authedRequest());

    expect(redisMock.client.expire).not.toHaveBeenCalled();
  });

  test('still authorizes when refreshing the TTL fails', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({
      userId: 'user-1',
      pwd: hash(PASSWORD_HASH),
      ttl: AUTH_SESSION_TTL,
    });
    redisMock.client.expire.mockRejectedValue(new Error('redis down'));
    mockUser();

    const result = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
  });
});

describe('checkAuth share tokens', () => {
  // GHSA-w2qx-g7w2-5qgj / GHSA-g4r3-g4pv-w7cx: share tokens are stateless, so the
  // share row must be re-checked or deleting a share never revokes access.
  const shareToken = {
    type: 'share',
    shareId: 'share-1',
    shareType: 1,
    websiteId: 'website-1',
    parameters: { overview: true, sessions: true },
  };

  function shareRequest() {
    return new Request('http://localhost/api/test', {
      headers: { 'x-umami-share-token': 'share-jwt', 'x-umami-share-context': '1' },
    });
  }

  beforeEach(() => {
    parseTokenMock.mockReturnValue(shareToken as any);
  });

  test('rejects a token whose share has been deleted', async () => {
    getShareMock.mockResolvedValue(null);

    expect(await checkAuth(shareRequest())).toBeNull();
    expect(getShareMock).toHaveBeenCalledWith('share-1');
  });

  test('rejects a token whose share now points at a different entity', async () => {
    getShareMock.mockResolvedValue({
      id: 'share-1',
      shareType: 1,
      entityId: 'website-2',
      parameters: {},
    } as any);

    expect(await checkAuth(shareRequest())).toBeNull();
  });

  test('rejects a token without a shareId', async () => {
    parseTokenMock.mockReturnValue({ type: 'share', websiteId: 'website-1' } as any);

    expect(await checkAuth(shareRequest())).toBeNull();
    expect(getShareMock).not.toHaveBeenCalled();
  });

  test('accepts a live share and uses its current parameters', async () => {
    getShareMock.mockResolvedValue({
      id: 'share-1',
      shareType: 1,
      entityId: 'website-1',
      parameters: { overview: true, sessions: false },
    } as any);

    const result: any = await checkAuth(shareRequest());

    expect(result?.authType).toBe('share');
    expect(result?.shareToken.websiteId).toBe('website-1');
    expect(result?.shareToken.parameters).toEqual({ overview: true, sessions: false });
  });
});
