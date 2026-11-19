import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getBearerToken: vi.fn(),
  saveAuth: vi.fn(),
  parseSecureToken: vi.fn(),
  createSecureToken: vi.fn(),
  getUser: vi.fn(),
  getAllUserTeams: vi.fn(),
  findTwoFactorAuth: vi.fn(),
  findBackupCodes: vi.fn(),
  updateBackupCodes: vi.fn(),
  verifyBackupCode: vi.fn(),
  decryptSecret: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
  reserveAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
  claimOtp: vi.fn(),
  verifyTotp: vi.fn(),
  secret: vi.fn(),
  hash: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getBearerToken: mocks.getBearerToken,
  saveAuth: mocks.saveAuth,
}));

vi.mock('@/lib/crypto', () => ({
  secret: mocks.secret,
  hash: mocks.hash,
}));

vi.mock('@/lib/jwt', () => ({
  createSecureToken: mocks.createSecureToken,
  parseSecureToken: mocks.parseSecureToken,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUser: mocks.getUser,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findTwoFactorAuth,
      },
      twoFactorBackupCode: {
        findMany: mocks.findBackupCodes,
        updateMany: mocks.updateBackupCodes,
      },
    },
  },
}));

vi.mock('@/lib/two-factor/backup-codes', () => ({
  verifyBackupCode: mocks.verifyBackupCode,
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  decryptSecret: mocks.decryptSecret,
  getTwoFactorConfigurationError: () => ({
    code: 'two-factor-error-not-configured',
    message: 'TWO_FACTOR_ENCRYPTION_KEY is missing or invalid',
  }),
  isTwoFactorConfigured: mocks.isTwoFactorConfigured,
}));

vi.mock('@/lib/two-factor/rate-limit', () => ({
  reserveAttempt: mocks.reserveAttempt,
  resetRateLimit: mocks.resetRateLimit,
}));

vi.mock('@/lib/two-factor/replay-prevention', () => ({
  claimOtp: mocks.claimOtp,
}));

vi.mock('@/lib/two-factor/totp', () => ({
  verifyTotp: mocks.verifyTotp,
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
  },
}));

import { POST } from './route';

beforeEach(() => {
  mocks.getBearerToken.mockReset();
  mocks.saveAuth.mockReset();
  mocks.parseSecureToken.mockReset();
  mocks.createSecureToken.mockReset();
  mocks.getUser.mockReset();
  mocks.getAllUserTeams.mockReset();
  mocks.findTwoFactorAuth.mockReset();
  mocks.findBackupCodes.mockReset();
  mocks.updateBackupCodes.mockReset();
  mocks.verifyBackupCode.mockReset();
  mocks.decryptSecret.mockReset();
  mocks.isTwoFactorConfigured.mockReset();
  mocks.reserveAttempt.mockReset();
  mocks.resetRateLimit.mockReset();
  mocks.claimOtp.mockReset();
  mocks.verifyTotp.mockReset();
  mocks.secret.mockReset();
  mocks.hash.mockReset();

  mocks.getBearerToken.mockReturnValue('partial-token');
  mocks.secret.mockReturnValue('app-secret');
  mocks.hash.mockReturnValue('pwd-fingerprint');
  mocks.parseSecureToken.mockReturnValue({ type: 'partial-auth', userId: 'user-1' });
  mocks.getUser.mockResolvedValue({
    id: 'user-1',
    username: 'alice',
    role: 'admin',
    createdAt: new Date('2026-07-23T00:00:00.000Z'),
    password: '$2b$10$hashedpassword',
  });
  mocks.getAllUserTeams.mockResolvedValue([]);
  mocks.findTwoFactorAuth.mockResolvedValue({
    userId: 'user-1',
    isEnabled: true,
    secret: 'encrypted',
  });
  mocks.createSecureToken.mockReturnValue('full-auth-token');
  mocks.decryptSecret.mockReturnValue('plain-secret');
  mocks.isTwoFactorConfigured.mockReturnValue(true);
  mocks.reserveAttempt.mockResolvedValue({ allowed: true });
  mocks.resetRateLimit.mockResolvedValue(undefined);
  mocks.claimOtp.mockResolvedValue(true);
  mocks.verifyTotp.mockResolvedValue(true);
  mocks.findBackupCodes.mockResolvedValue([]);
  mocks.updateBackupCodes.mockResolvedValue({ count: 0 });
  mocks.verifyBackupCode.mockResolvedValue(null);
});

test('POST accepts a token-only payload and completes 2FA verification', async () => {
  const response = await POST(
    new Request('http://localhost/api/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer partial-token',
      },
      body: JSON.stringify({ token: '123456' }),
    }),
  );

  expect(mocks.verifyTotp).toHaveBeenCalledWith('123456', 'plain-secret');
  expect(mocks.claimOtp).toHaveBeenCalledWith('user-1', '123456');
  expect(mocks.resetRateLimit).toHaveBeenCalledWith('user-1');
  // Full session must not carry the partial-auth type and must be bound to the password.
  expect(mocks.hash).toHaveBeenCalledWith('$2b$10$hashedpassword');
  expect(mocks.createSecureToken).toHaveBeenCalledWith(
    { userId: 'user-1', role: 'admin', pwd: 'pwd-fingerprint' },
    'app-secret',
  );
  const data = await response.json();
  expect(data).toMatchObject({
    token: 'full-auth-token',
    user: {
      id: 'user-1',
      username: 'alice',
    },
  });
  expect(data.user).not.toHaveProperty('password');
  expect(response.status).toBe(200);
});

test('POST returns a configuration error when the encryption key is missing', async () => {
  mocks.isTwoFactorConfigured.mockReturnValue(false);

  const response = await POST(
    new Request('http://localhost/api/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer partial-token',
      },
      body: JSON.stringify({ token: '123456' }),
    }),
  );

  expect(mocks.findTwoFactorAuth).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-not-configured',
    },
  });
  expect(response.status).toBe(503);
});

test('POST rejects a valid code another request already claimed, without minting a session', async () => {
  // Two concurrent submissions of the same code both pass verifyTotp; only the one that wins
  // the atomic claim may receive a session, otherwise one code mints multiple sessions.
  mocks.claimOtp.mockResolvedValue(false);

  const response = await POST(
    new Request('http://localhost/api/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer partial-token',
      },
      body: JSON.stringify({ token: '123456' }),
    }),
  );

  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'two-factor-error-code-used' },
  });
  expect(response.status).toBe(400);
  expect(mocks.createSecureToken).not.toHaveBeenCalled();
  expect(mocks.saveAuth).not.toHaveBeenCalled();
  expect(mocks.resetRateLimit).not.toHaveBeenCalled();
});

test('POST does not check the code when no attempt can be reserved', async () => {
  // Concurrent guesses must each reserve an attempt first; once the limit is hit, further
  // guesses are rejected before verification so a burst cannot test more than the limit.
  const lockedUntil = new Date(Date.now() + 60_000);
  mocks.reserveAttempt.mockResolvedValue({ allowed: false, lockedUntil });

  const response = await POST(
    new Request('http://localhost/api/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer partial-token',
      },
      body: JSON.stringify({ token: '123456' }),
    }),
  );

  expect(response.status).toBe(429);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'two-factor-error-too-many-attempts' },
  });
  expect(mocks.verifyTotp).not.toHaveBeenCalled();
  expect(mocks.verifyBackupCode).not.toHaveBeenCalled();
  expect(mocks.createSecureToken).not.toHaveBeenCalled();
});
