import { beforeEach, describe, expect, test, vi } from 'vitest';
import { auth as betterAuth } from '@/lib/auth-server';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { parseToken } from '@/lib/jwt';
import { getUser } from '@/queries/prisma/user';
import { checkAuth } from './auth';

vi.mock('@/lib/auth-server', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/jwt', () => ({
  parseToken: vi.fn(() => null),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

const getSessionMock = vi.mocked(betterAuth.api.getSession);
const parseTokenMock = vi.mocked(parseToken);
const getUserMock = vi.mocked(getUser);

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/test', { headers });
}

function mockSession(userId = 'user-1') {
  getSessionMock.mockResolvedValue({
    session: { token: 'session-token', userId },
    user: { id: userId },
  } as any);
}

function mockUser(role = 'user') {
  getUserMock.mockResolvedValue({
    id: 'user-1',
    username: 'bob',
    role,
    createdAt: new Date(),
  } as any);
}

beforeEach(() => {
  getSessionMock.mockReset();
  getSessionMock.mockResolvedValue(null);
  parseTokenMock.mockReset();
  parseTokenMock.mockReturnValue(null);
  getUserMock.mockReset();
});

describe('checkAuth sessions', () => {
  test('authorizes a request with a valid session', async () => {
    mockSession();
    mockUser();

    const result = await checkAuth(request());

    expect(result?.user?.id).toBe('user-1');
    expect(result?.token).toBe('session-token');
  });

  test('rejects a request without a session or share token', async () => {
    const result = await checkAuth(request());

    expect(result).toBeNull();
  });

  test('rejects a session for a soft-deleted user', async () => {
    mockSession();
    // getUser filters deletedAt and returns null for deleted users.
    getUserMock.mockResolvedValue(null);

    const result = await checkAuth(request());

    expect(result).toBeNull();
  });

  test('sets isAdmin for admin users', async () => {
    mockSession();
    mockUser('admin');

    const result = await checkAuth(request());

    expect(result?.user?.isAdmin).toBe(true);
  });

  test('does not set isAdmin for regular users', async () => {
    mockSession();
    mockUser('user');

    const result = await checkAuth(request());

    expect(result?.user?.isAdmin).toBe(false);
  });
});

describe('checkAuth share tokens', () => {
  test('authorizes a share token within a share context', async () => {
    parseTokenMock.mockReturnValue({ type: 'share', websiteId: 'website-1' } as any);

    const result = await checkAuth(
      request({ [SHARE_TOKEN_HEADER]: 'share-token', [SHARE_CONTEXT_HEADER]: '1' }),
    );

    expect(result?.shareToken).toEqual({ type: 'share', websiteId: 'website-1' });
    expect(result?.user).toBeNull();
  });

  test('rejects a share token used outside a share context', async () => {
    parseTokenMock.mockReturnValue({ type: 'share', websiteId: 'website-1' } as any);

    const result = await checkAuth(request({ [SHARE_TOKEN_HEADER]: 'share-token' }));

    expect(result).toBeNull();
  });

  test('rejects tokens that are not share tokens', async () => {
    // e.g. the cache token from /api/send is signed with the same secret.
    parseTokenMock.mockReturnValue({ websiteId: 'website-1' } as any);

    const result = await checkAuth(request({ [SHARE_TOKEN_HEADER]: 'cache-token' }));

    expect(result).toBeNull();
  });
});
