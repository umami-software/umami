import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getUserByUsername: vi.fn(),
  checkPassword: vi.fn(),
  hasDefaultPassword: vi.fn(),
  findTwoFactorAuth: vi.fn(),
  createSecureToken: vi.fn(),
  secret: vi.fn(),
  hash: vi.fn(),
  getAllUserTeams: vi.fn(),
  saveAuth: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
  getTwoFactorRequiredReason: vi.fn(),
  addTeamBillingStatus: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUserByUsername: mocks.getUserByUsername,
}));

vi.mock('@/lib/password', () => ({
  checkPassword: mocks.checkPassword,
  hasDefaultPassword: mocks.hasDefaultPassword,
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

vi.mock('@/lib/two-factor/policy', () => ({
  getTwoFactorRequiredReason: mocks.getTwoFactorRequiredReason,
}));

vi.mock('@/lib/load', () => ({
  addTeamBillingStatus: mocks.addTeamBillingStatus,
}));

import { POST } from './route';

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getUserByUsername.mockReset();
  mocks.checkPassword.mockReset();
  mocks.hasDefaultPassword.mockReset();
  mocks.hasDefaultPassword.mockReturnValue(false);
  mocks.findTwoFactorAuth.mockReset();
  mocks.createSecureToken.mockReset();
  mocks.secret.mockReset();
  mocks.hash.mockReset();
  mocks.getAllUserTeams.mockReset();
  mocks.saveAuth.mockReset();
  mocks.isTwoFactorConfigured.mockReset();
  mocks.getTwoFactorRequiredReason.mockReset();
  mocks.addTeamBillingStatus.mockReset();

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
  mocks.getTwoFactorRequiredReason.mockResolvedValue(null);
  mocks.addTeamBillingStatus.mockResolvedValue([]);
  mocks.hash.mockReturnValue('pwd-fingerprint');
  mocks.secret.mockReturnValue('app-secret');
  mocks.createSecureToken.mockReturnValue('full-auth-token');
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

test('POST limits the session to 2FA setup when 2FA is required but not set up', async () => {
  // Required 2FA must hold for direct API logins too, not only in the UI's setup modal.
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.getTwoFactorRequiredReason.mockResolvedValue('team');

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.getTwoFactorRequiredReason).toHaveBeenCalledWith('user-1');
  expect(mocks.createSecureToken).toHaveBeenCalledWith(
    { userId: 'user-1', role: 'admin', pwd: 'pwd-fingerprint', twoFactorSetup: true },
    'app-secret',
  );
  expect(response.status).toBe(200);
});

test('POST issues an unrestricted session when 2FA is not required', async () => {
  mocks.findTwoFactorAuth.mockResolvedValue(null);

  await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.createSecureToken).toHaveBeenCalledWith(
    { userId: 'user-1', role: 'admin', pwd: 'pwd-fingerprint' },
    'app-secret',
  );
});

test('POST tells the seeded administrator to change its initial password', async () => {
  // The app relies on this flag to show the password dialog right after login.
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.hasDefaultPassword.mockReturnValue(true);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.hasDefaultPassword).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'user-1', password: 'hashed-password' }),
  );
  await expect(response.json()).resolves.toMatchObject({
    user: { passwordChangeRequired: true },
  });
});

test('POST does not flag users whose password has been changed', async () => {
  mocks.findTwoFactorAuth.mockResolvedValue(null);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  await expect(response.json()).resolves.toMatchObject({
    user: { passwordChangeRequired: false },
  });
});

test('POST does not restrict the session when 2FA cannot be configured', async () => {
  // Without an encryption key users cannot set up 2FA, so restricting them would lock them out.
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.isTwoFactorConfigured.mockReturnValue(false);
  mocks.getTwoFactorRequiredReason.mockResolvedValue('global');

  await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.createSecureToken).toHaveBeenCalledWith(
    { userId: 'user-1', role: 'admin', pwd: 'pwd-fingerprint' },
    'app-secret',
  );
});
