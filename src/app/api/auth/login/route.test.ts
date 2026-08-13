import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getUserByUsername: vi.fn(),
  getAllUserTeams: vi.fn(),
  checkPassword: vi.fn(),
  createSecureToken: vi.fn(),
  saveAuth: vi.fn(),
  findTwoFactorAuth: vi.fn(),
  hash: vi.fn(),
  secret: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  saveAuth: mocks.saveAuth,
}));

vi.mock('@/lib/crypto', () => ({
  hash: mocks.hash,
  secret: mocks.secret,
}));

vi.mock('@/lib/jwt', () => ({
  createSecureToken: mocks.createSecureToken,
}));

vi.mock('@/lib/password', () => ({
  checkPassword: mocks.checkPassword,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findTwoFactorAuth,
      },
    },
  },
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
  },
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUserByUsername: mocks.getUserByUsername,
}));

import { POST } from './route';

function createRequest(username: string) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'password' }),
  });
}

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getUserByUsername.mockReset();
  mocks.getAllUserTeams.mockReset();
  mocks.checkPassword.mockReset();
  mocks.createSecureToken.mockReset();
  mocks.saveAuth.mockReset();
  mocks.findTwoFactorAuth.mockReset();
  mocks.hash.mockReset();
  mocks.secret.mockReset();

  mocks.parseRequest.mockResolvedValue({
    body: { username: 'KaKi87', password: 'password' },
    error: undefined,
  });
  mocks.getUserByUsername.mockResolvedValue({
    id: 'user-1',
    username: 'kaki87',
    password: 'password-hash',
    role: 'admin',
    createdAt: new Date('2026-07-23T00:00:00.000Z'),
  });
  mocks.checkPassword.mockReturnValue(true);
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.getAllUserTeams.mockResolvedValue([]);
  mocks.hash.mockReturnValue('password-fingerprint');
  mocks.secret.mockReturnValue('app-secret');
  mocks.createSecureToken.mockReturnValue('auth-token');
});

test('POST returns the stored username instead of the submitted one', async () => {
  const response = await POST(createRequest('KaKi87'));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    token: 'auth-token',
    user: {
      id: 'user-1',
      username: 'kaki87',
      isAdmin: true,
    },
  });
});

test('POST returns unauthorized when the username does not match a user', async () => {
  mocks.getUserByUsername.mockResolvedValue(null);

  const response = await POST(createRequest('KaKi87'));

  expect(mocks.checkPassword).not.toHaveBeenCalled();
  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'incorrect-username-password' },
  });
});
