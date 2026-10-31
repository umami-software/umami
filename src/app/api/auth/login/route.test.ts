import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getUserByUsername: vi.fn(),
  checkPassword: vi.fn(),
  findTwoFactorAuth: vi.fn(),
  createSecureToken: vi.fn(),
  secret: vi.fn(),
  hash: vi.fn(),
  getAllUserTeams: vi.fn(),
  getUserSecurityKeyCount: vi.fn(),
  saveAuth: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUserByUsername: mocks.getUserByUsername,
  getUserSecurityKeyCount: mocks.getUserSecurityKeyCount,
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

vi.mock('@/lib/jwt', () => ({
  createSecureToken: mocks.createSecureToken,
}));

vi.mock('@/lib/crypto', () => ({
  hash: mocks.hash,
  secret: mocks.secret,
}));

vi.mock('@/lib/auth', () => ({
  saveAuth: mocks.saveAuth,
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
  },
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  getTwoFactorConfigurationError: () => ({
    code: 'two-factor-error-not-configured',
    message: 'TWO_FACTOR_ENCRYPTION_KEY is missing or invalid',
  }),
  isTwoFactorConfigured: mocks.isTwoFactorConfigured,
}));

import { POST } from './route';

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getUserByUsername.mockReset();
  mocks.checkPassword.mockReset();
  mocks.findTwoFactorAuth.mockReset();
  mocks.createSecureToken.mockReset();
  mocks.secret.mockReset();
  mocks.hash.mockReset();
  mocks.getAllUserTeams.mockReset();
  mocks.getUserSecurityKeyCount.mockReset();
  mocks.saveAuth.mockReset();
  mocks.isTwoFactorConfigured.mockReset();

  mocks.parseRequest.mockResolvedValue({
    body: { username: 'alice', password: 'secret' },
    error: undefined,
  });
  mocks.getUserByUsername.mockResolvedValue({
    id: 'user-1',
    username: 'alice',
    password: 'hashed-password',
    role: 'admin',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
  });
  mocks.checkPassword.mockReturnValue(true);
  mocks.findTwoFactorAuth.mockResolvedValue({ userId: 'user-1', isEnabled: true });
  mocks.isTwoFactorConfigured.mockReturnValue(true);
  mocks.getUserSecurityKeyCount.mockResolvedValue(0);
  mocks.createSecureToken.mockReturnValue('partial-token');
});

test('POST returns a configuration error instead of partial auth when 2FA is enabled but unavailable', async () => {
  mocks.isTwoFactorConfigured.mockReturnValue(false);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.createSecureToken).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-not-configured',
    },
  });
  expect(response.status).toBe(503);
});

test('POST returns a partial token with the totp method when 2FA is enabled', async () => {
  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    requiresTwoFactor: true,
    partialToken: 'partial-token',
    methods: ['totp'],
  });
});

test('POST requires a security key when the user has one registered', async () => {
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.getUserSecurityKeyCount.mockResolvedValue(1);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  await expect(response.json()).resolves.toEqual({
    requiresTwoFactor: true,
    partialToken: 'partial-token',
    methods: ['security-key'],
  });
});

test('POST offers both methods when the user has an authenticator app and a security key', async () => {
  mocks.getUserSecurityKeyCount.mockResolvedValue(2);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  await expect(response.json()).resolves.toMatchObject({
    methods: ['totp', 'security-key'],
  });
});

test('POST still allows security keys when the 2FA encryption key is missing', async () => {
  mocks.isTwoFactorConfigured.mockReturnValue(false);
  mocks.getUserSecurityKeyCount.mockResolvedValue(1);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    methods: ['security-key'],
  });
});
