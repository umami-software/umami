import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {},
  },
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  decryptSecret: vi.fn(),
  getTwoFactorConfigurationError: () => ({
    code: 'two-factor-error-not-configured',
    message: 'TWO_FACTOR_ENCRYPTION_KEY is missing or invalid',
  }),
  isTwoFactorConfigured: mocks.isTwoFactorConfigured,
}));

vi.mock('@/lib/two-factor/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
}));

vi.mock('@/lib/two-factor/replay-prevention', () => ({
  isOtpReplayed: vi.fn(),
  markOtpUsed: vi.fn(),
}));

vi.mock('@/lib/two-factor/totp', () => ({
  verifyTotp: vi.fn(),
}));

vi.mock('@/lib/password', () => ({
  checkPassword: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
}));

import { POST } from './route';

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.isTwoFactorConfigured.mockReset();

  mocks.isTwoFactorConfigured.mockReturnValue(true);
});

test('POST returns a configuration error after validating the caller', async () => {
  mocks.isTwoFactorConfigured.mockReturnValue(false);
  mocks.parseRequest.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { password: 'secret', token: '123456' },
    error: undefined,
  });

  const response = await POST(new Request('http://localhost/api/2fa/disable', { method: 'POST' }));

  expect(mocks.parseRequest).toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-not-configured',
    },
  });
  expect(response.status).toBe(503);
});
