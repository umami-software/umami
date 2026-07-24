import { beforeEach, expect, test, vi } from 'vitest';
import { POST } from './route';

const mocks = vi.hoisted(() => {
  const tx = {
    twoFactorAuth: {
      update: vi.fn(),
    },
    twoFactorBackupCode: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  };

  return {
    parseRequest: vi.fn(),
    findUnique: vi.fn(),
    transaction: vi.fn(),
    tx,
    generateBackupCodes: vi.fn(),
    decryptSecret: vi.fn(),
    checkRateLimit: vi.fn(),
    recordFailedAttempt: vi.fn(),
    resetRateLimit: vi.fn(),
    isOtpReplayed: vi.fn(),
    markOtpUsed: vi.fn(),
    verifyTotp: vi.fn(),
  };
});

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findUnique,
      },
    },
    transaction: mocks.transaction,
  },
}));

vi.mock('@/lib/two-factor/backup-codes', () => ({
  generateBackupCodes: mocks.generateBackupCodes,
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  decryptSecret: mocks.decryptSecret,
}));

vi.mock('@/lib/two-factor/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  recordFailedAttempt: mocks.recordFailedAttempt,
  resetRateLimit: mocks.resetRateLimit,
}));

vi.mock('@/lib/two-factor/replay-prevention', () => ({
  isOtpReplayed: mocks.isOtpReplayed,
  markOtpUsed: mocks.markOtpUsed,
}));

vi.mock('@/lib/two-factor/totp', () => ({
  verifyTotp: mocks.verifyTotp,
}));

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.findUnique.mockReset();
  mocks.transaction.mockReset();
  mocks.tx.twoFactorAuth.update.mockReset();
  mocks.tx.twoFactorBackupCode.deleteMany.mockReset();
  mocks.tx.twoFactorBackupCode.createMany.mockReset();
  mocks.generateBackupCodes.mockReset();
  mocks.decryptSecret.mockReset();
  mocks.checkRateLimit.mockReset();
  mocks.recordFailedAttempt.mockReset();
  mocks.resetRateLimit.mockReset();
  mocks.isOtpReplayed.mockReset();
  mocks.markOtpUsed.mockReset();
  mocks.verifyTotp.mockReset();

  mocks.parseRequest.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { token: '123456' },
    error: undefined,
  });
  mocks.findUnique.mockResolvedValue({ userId: 'user-1', isEnabled: false, secret: 'encrypted' });
  mocks.transaction.mockImplementation(async callback => callback(mocks.tx));
  mocks.generateBackupCodes.mockResolvedValue({
    plaintext: ['code-1', 'code-2'],
    hashed: ['hash-1', 'hash-2'],
  });
  mocks.decryptSecret.mockReturnValue('plain-secret');
  mocks.checkRateLimit.mockResolvedValue({ allowed: true });
  mocks.recordFailedAttempt.mockResolvedValue({ lockedUntil: undefined });
  mocks.resetRateLimit.mockResolvedValue(undefined);
  mocks.isOtpReplayed.mockResolvedValue(false);
  mocks.markOtpUsed.mockResolvedValue(undefined);
  mocks.verifyTotp.mockResolvedValue(true);
  mocks.tx.twoFactorAuth.update.mockResolvedValue(undefined);
  mocks.tx.twoFactorBackupCode.deleteMany.mockResolvedValue(undefined);
  mocks.tx.twoFactorBackupCode.createMany.mockResolvedValue(undefined);
});

test('POST confirms setup, enables 2FA, stores backup codes, and resets the rate limit', async () => {
  const response = await POST(
    new Request('http://localhost/api/2fa/setup/confirm', { method: 'POST' }),
  );

  expect(mocks.checkRateLimit).toHaveBeenCalledWith('user-1');
  expect(mocks.decryptSecret).toHaveBeenCalledWith('encrypted');
  expect(mocks.verifyTotp).toHaveBeenCalledWith('123456', 'plain-secret');
  expect(mocks.tx.twoFactorAuth.update).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
    data: { isEnabled: true },
  });
  expect(mocks.tx.twoFactorBackupCode.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  expect(mocks.tx.twoFactorBackupCode.createMany).toHaveBeenCalledWith({
    data: [
      { userId: 'user-1', codeHash: 'hash-1' },
      { userId: 'user-1', codeHash: 'hash-2' },
    ],
  });
  expect(mocks.markOtpUsed).toHaveBeenCalledWith('user-1', '123456', mocks.tx);
  expect(mocks.resetRateLimit).toHaveBeenCalledWith('user-1');
  await expect(response.json()).resolves.toEqual({
    backupCodes: ['code-1', 'code-2'],
  });
  expect(response.status).toBe(200);
});

test('POST records a failed attempt and skips writes when the token is invalid', async () => {
  mocks.verifyTotp.mockResolvedValue(false);

  const response = await POST(
    new Request('http://localhost/api/2fa/setup/confirm', { method: 'POST' }),
  );

  expect(mocks.recordFailedAttempt).toHaveBeenCalledWith('user-1');
  expect(mocks.transaction).not.toHaveBeenCalled();
  expect(mocks.resetRateLimit).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-invalid-code',
    },
  });
  expect(response.status).toBe(400);
});
