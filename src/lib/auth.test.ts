import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AUTH_SESSION_TTL } from '@/lib/constants';
import { hash } from '@/lib/crypto';
import { createSecureToken, parseSecureToken, parseToken } from '@/lib/jwt';
import redis from '@/lib/redis';
import { getApiKeyByHash, updateApiKeyLastUsed } from '@/queries/prisma/apiKey';
import { getShare } from '@/queries/prisma/share';
import { getUser } from '@/queries/prisma/user';
import { hashApiKey } from './api-key';
import { checkAuth, createSessionToken, hasPermission } from './auth';

vi.hoisted(() => {
  process.env.APP_SECRET ??= 'test-app-secret';
});

vi.mock('@/lib/jwt', () => ({
  createSecureToken: vi.fn(),
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

const prismaMocks = vi.hoisted(() => ({
  findTwoFactorAuth: vi.fn(),
  findBoard: vi.fn(),
  findWebsites: vi.fn(),
  findPixels: vi.fn(),
  findLinks: vi.fn(),
  findTeamUsers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: { findUnique: prismaMocks.findTwoFactorAuth },
      board: { findUnique: prismaMocks.findBoard },
      website: { findMany: prismaMocks.findWebsites },
      pixel: { findMany: prismaMocks.findPixels },
      link: { findMany: prismaMocks.findLinks },
      teamUser: { findMany: prismaMocks.findTeamUsers },
    },
  },
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
    client: {
      get: vi.fn(),
      set: vi.fn(),
      expire: vi.fn().mockResolvedValue(true),
    },
  },
}));

const createSecureTokenMock = vi.mocked(createSecureToken);
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
    set: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
  };
};

const PASSWORD_HASH = '$2b$10$currentpasswordhashvalue';

function authedRequest() {
  return new Request('http://localhost/api/test', {
    headers: { authorization: 'Bearer secure-token' },
  });
}

function mockUser(overrides: Record<string, unknown> = {}) {
  getUserMock.mockResolvedValue({
    id: 'user-1',
    username: 'bob',
    role: 'user',
    password: PASSWORD_HASH,
    ...overrides,
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
  redisMock.client.set.mockReset();
  createSecureTokenMock.mockReset();
  redisMock.client.expire.mockReset();
  redisMock.client.expire.mockResolvedValue(true);
  prismaMocks.findTwoFactorAuth.mockReset();
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

  test('marks a session that must change its seeded password', async () => {
    const systemUserId = '41e2b680-648e-4b09-bcd7-3e2b10c06264';
    const systemUserPasswordHash = '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa';
    parseSecureTokenMock.mockReturnValue({
      userId: systemUserId,
      pwd: hash(systemUserPasswordHash),
    } as any);
    mockUser({ id: systemUserId, password: systemUserPasswordHash });

    const result: any = await checkAuth(authedRequest());

    expect(result?.passwordChangeRequired).toBe(true);
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

describe('checkAuth board share tokens', () => {
  // Board share tokens embed the board's entity ids when minted. Removing an entity from the
  // board, or transferring it to someone else, must take effect for tokens already issued.
  type Owned = { id: string; userId: string | null; teamId: string | null };

  function boardWith(
    websiteIds: string[],
    owner: { userId?: string; teamId?: string; ownerDeleted?: boolean },
  ) {
    return {
      type: 'mixed',
      parameters: {
        rows: [{ columns: websiteIds.map(websiteId => ({ component: { websiteId } })) }],
      },
      userId: owner.userId ?? null,
      teamId: owner.teamId ?? null,
      user: owner.userId
        ? {
            id: owner.userId,
            role: 'user',
            deletedAt: owner.ownerDeleted ? new Date() : null,
          }
        : null,
    };
  }

  function withWebsites(websites: Owned[]) {
    prismaMocks.findWebsites.mockImplementation(async ({ where }: any) =>
      websites.filter(({ id }) => where.id.in.includes(id)),
    );
  }

  async function boardShareWebsiteIds(tokenWebsiteIds: string[]) {
    parseTokenMock.mockReturnValue({
      type: 'share',
      shareId: 'share-1',
      shareType: 4,
      boardId: 'board-1',
      websiteIds: tokenWebsiteIds,
      pixelIds: [],
      linkIds: [],
    } as any);

    const result: any = await checkAuth(
      new Request('http://localhost/api/test', {
        headers: { 'x-umami-share-token': 'share-jwt', 'x-umami-share-context': '1' },
      }),
    );

    return result?.shareToken.websiteIds;
  }

  beforeEach(() => {
    getShareMock.mockResolvedValue({
      id: 'share-1',
      shareType: 4,
      entityId: 'board-1',
      parameters: {},
    } as any);
    prismaMocks.findTeamUsers.mockResolvedValue([]);
  });

  test('exposes nothing once the board owner has been deleted', async () => {
    prismaMocks.findBoard.mockResolvedValue(
      boardWith(['site-a'], { userId: 'owner-1', ownerDeleted: true }),
    );
    withWebsites([{ id: 'site-a', userId: 'owner-1', teamId: null }]);

    expect(await boardShareWebsiteIds(['site-a'])).toEqual([]);
  });

  test('drops a website that has been removed from the board', async () => {
    prismaMocks.findBoard.mockResolvedValue(boardWith(['site-b'], { userId: 'owner-1' }));
    withWebsites([
      { id: 'site-a', userId: 'owner-1', teamId: null },
      { id: 'site-b', userId: 'owner-1', teamId: null },
    ]);

    expect(await boardShareWebsiteIds(['site-a', 'site-b'])).toEqual(['site-b']);
  });

  test('drops a website transferred to another user while still on the board', async () => {
    prismaMocks.findBoard.mockResolvedValue(boardWith(['site-a', 'site-b'], { userId: 'owner-1' }));
    withWebsites([
      { id: 'site-a', userId: 'new-owner', teamId: null },
      { id: 'site-b', userId: 'owner-1', teamId: null },
    ]);

    expect(await boardShareWebsiteIds(['site-a', 'site-b'])).toEqual(['site-b']);
  });

  test('keeps a team website on a personal board only while the owner is a team member', async () => {
    prismaMocks.findBoard.mockResolvedValue(boardWith(['site-t'], { userId: 'owner-1' }));
    withWebsites([{ id: 'site-t', userId: null, teamId: 'team-1' }]);

    prismaMocks.findTeamUsers.mockResolvedValue([{ teamId: 'team-1' }]);
    expect(await boardShareWebsiteIds(['site-t'])).toEqual(['site-t']);

    prismaMocks.findTeamUsers.mockResolvedValue([]);
    expect(await boardShareWebsiteIds(['site-t'])).toEqual([]);
  });

  test('keeps only websites the team owns on a team board', async () => {
    prismaMocks.findBoard.mockResolvedValue(boardWith(['site-t', 'site-x'], { teamId: 'team-1' }));
    withWebsites([
      { id: 'site-t', userId: null, teamId: 'team-1' },
      { id: 'site-x', userId: null, teamId: 'team-2' },
    ]);

    expect(await boardShareWebsiteIds(['site-t', 'site-x'])).toEqual(['site-t']);
  });

  test('never grants a website the token was not minted with', async () => {
    prismaMocks.findBoard.mockResolvedValue(boardWith(['site-a', 'site-b'], { userId: 'owner-1' }));
    withWebsites([
      { id: 'site-a', userId: 'owner-1', teamId: null },
      { id: 'site-b', userId: 'owner-1', teamId: null },
    ]);

    expect(await boardShareWebsiteIds(['site-a'])).toEqual(['site-a']);
  });
});

describe('checkAuth required 2FA setup', () => {
  test('flags a session issued before required 2FA was set up', async () => {
    // Without this flag a password alone would grant full access to accounts the admin requires
    // to use 2FA; parseRequest uses it to limit the session to the setup routes.
    parseSecureTokenMock.mockReturnValue({
      userId: 'user-1',
      pwd: hash(PASSWORD_HASH),
      twoFactorSetup: true,
    } as any);
    mockUser();
    prismaMocks.findTwoFactorAuth.mockResolvedValue(null);

    const result: any = await checkAuth(authedRequest());

    expect(result?.user?.id).toBe('user-1');
    expect(result?.twoFactorSetupPending).toBe(true);
  });

  test('keeps a setup that was started but not confirmed restricted', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', twoFactorSetup: true } as any);
    mockUser();
    prismaMocks.findTwoFactorAuth.mockResolvedValue({ isEnabled: false });

    const result: any = await checkAuth(authedRequest());

    expect(result?.twoFactorSetupPending).toBe(true);
  });

  test('lifts the restriction on the same token once 2FA is enabled', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', twoFactorSetup: true } as any);
    mockUser();
    prismaMocks.findTwoFactorAuth.mockResolvedValue({ isEnabled: true });

    const result: any = await checkAuth(authedRequest());

    expect(result?.twoFactorSetupPending).toBe(false);
  });

  test('flags a Redis session issued before required 2FA was set up', async () => {
    redisMock.enabled = true;
    parseSecureTokenMock.mockReturnValue({ authKey: 'auth:session-key' } as any);
    redisMock.client.get.mockResolvedValue({
      userId: 'user-1',
      pwd: hash(PASSWORD_HASH),
      twoFactorSetup: true,
    });
    mockUser();
    prismaMocks.findTwoFactorAuth.mockResolvedValue(null);

    const result: any = await checkAuth(authedRequest());

    expect(result?.twoFactorSetupPending).toBe(true);
  });

  test('does not look up 2FA for ordinary sessions', async () => {
    parseSecureTokenMock.mockReturnValue({ userId: 'user-1', pwd: hash(PASSWORD_HASH) } as any);
    mockUser();

    const result: any = await checkAuth(authedRequest());

    expect(result?.twoFactorSetupPending).toBe(false);
    expect(prismaMocks.findTwoFactorAuth).not.toHaveBeenCalled();
  });
});

describe('createSessionToken', () => {
  const NEW_PASSWORD_HASH = '$2b$10$newpasswordhashvalue';

  test('issues a stateless session that checkAuth accepts until the password changes again', async () => {
    // Issued after a password change so the user stays signed in; it must still be cut off by
    // the next password change like any other session.
    createSecureTokenMock.mockImplementation(payload => payload as any);

    const session: any = await createSessionToken({
      id: 'user-1',
      role: 'user',
      password: NEW_PASSWORD_HASH,
    });

    parseSecureTokenMock.mockReturnValue(session);
    mockUser({ password: NEW_PASSWORD_HASH });
    expect((await checkAuth(authedRequest()))?.user?.id).toBe('user-1');

    mockUser({ password: '$2b$10$passwordchangedagain' });
    expect(await checkAuth(authedRequest())).toBeNull();
  });

  test('stores a Redis session bound to the new password', async () => {
    redisMock.enabled = true;
    createSecureTokenMock.mockReturnValue('redis-session-token' as any);

    const token = await createSessionToken({
      id: 'user-1',
      role: 'user',
      password: NEW_PASSWORD_HASH,
    });

    expect(token).toBe('redis-session-token');
    expect(redisMock.client.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:/),
      expect.objectContaining({ userId: 'user-1', role: 'user', pwd: hash(NEW_PASSWORD_HASH) }),
      AUTH_SESSION_TTL,
    );
  });
});

// Permission checks use this in plain conditions like `if (!hasPermission(...))`.
// If it returned a Promise, those conditions would always pass and grant access.
test('hasPermission returns a boolean synchronously', () => {
  expect(hasPermission('view-only', 'website:update')).toBe(false);
  expect(hasPermission('user', 'website:update')).toBe(true);
});
