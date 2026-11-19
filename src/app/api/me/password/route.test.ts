import { beforeEach, expect, test, vi } from 'vitest';
import { createSessionToken } from '@/lib/auth';
import { checkPassword, hashPassword } from '@/lib/password';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { getUser, updateUser } from '@/queries/prisma/user';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  createSessionToken: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
    client: { del: vi.fn() },
  },
}));

vi.mock('@/lib/password', () => ({
  checkPassword: vi.fn(),
  hashPassword: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getUserMock = vi.mocked(getUser);
const updateUserMock = vi.mocked(updateUser);
const checkPasswordMock = vi.mocked(checkPassword);
const hashPasswordMock = vi.mocked(hashPassword);
const createSessionTokenMock = vi.mocked(createSessionToken);
const redisMock = redis as unknown as {
  enabled: boolean;
  client: { del: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  parseRequestMock.mockReset();
  getUserMock.mockReset();
  updateUserMock.mockReset();
  checkPasswordMock.mockReset();
  hashPasswordMock.mockReset();
  createSessionTokenMock.mockReset();
  redisMock.enabled = false;
  redisMock.client.del.mockReset();
});

function mockSuccessfulChange(auth: Record<string, unknown> = {}) {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'admin-user' }, ...auth },
    body: { currentPassword: 'umami', newPassword: 'new-password' },
    error: undefined,
  } as any);
  getUserMock.mockResolvedValue({
    id: 'admin-user',
    role: 'admin',
    password: 'seeded-password',
  } as any);
  checkPasswordMock.mockReturnValue(true);
  hashPasswordMock.mockReturnValue('new-password-hash');
  updateUserMock.mockResolvedValue({ id: 'admin-user' } as any);
  createSessionTokenMock.mockResolvedValue('new-session-token');
}

function changePassword() {
  return POST(new Request('http://localhost/api/me/password', { method: 'POST' }));
}

test('POST keeps the user signed in with a session bound to the new password', async () => {
  // Changing the password invalidates every existing token, including the one used here.
  mockSuccessfulChange();

  const response = await changePassword();

  expect(createSessionTokenMock).toHaveBeenCalledWith({
    id: 'admin-user',
    role: 'admin',
    password: 'new-password-hash',
  });
  await expect(response.json()).resolves.toMatchObject({
    id: 'admin-user',
    token: 'new-session-token',
  });
});

test('POST removes the replaced Redis session', async () => {
  redisMock.enabled = true;
  mockSuccessfulChange({ authKey: 'auth:old-session' });

  await changePassword();

  expect(redisMock.client.del).toHaveBeenCalledWith('auth:old-session');
});

test('POST does not issue a session when the current password is wrong', async () => {
  mockSuccessfulChange();
  checkPasswordMock.mockReturnValue(false);

  const response = await changePassword();

  expect(response.status).toBe(400);
  expect(createSessionTokenMock).not.toHaveBeenCalled();
  expect(updateUserMock).not.toHaveBeenCalled();
});

// The user can be deleted after the request was authenticated.
test('POST returns 404 when the user no longer exists', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'deleted-user' } },
    body: { currentPassword: 'old-password', newPassword: 'new-password' },
    error: undefined,
  } as any);
  getUserMock.mockResolvedValue(null);

  const response = await POST(new Request('http://localhost/api/me/password', { method: 'POST' }));

  expect(response.status).toBe(404);
  expect(updateUserMock).not.toHaveBeenCalled();
});
