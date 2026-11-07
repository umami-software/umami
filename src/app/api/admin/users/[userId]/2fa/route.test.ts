import { beforeEach, expect, test, vi } from 'vitest';
import { canEnforceTwoFactorAuthForUser } from '@/permissions';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { isTwoFactorConfigured } from '@/lib/two-factor/crypto';
import { updateUser } from '@/queries/prisma/user';
import { DELETE, GET, POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canEnforceTwoFactorAuthForUser: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  updateUser: vi.fn(),
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  getTwoFactorConfigurationError: () => ({
    code: 'two-factor-error-not-configured',
    message: 'TWO_FACTOR_ENCRYPTION_KEY is missing or invalid',
  }),
  isTwoFactorConfigured: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
      },
      twoFactorBackupCode: {
        deleteMany: vi.fn(),
      },
      twoFactorOtpUsed: {
        deleteMany: vi.fn(),
      },
      twoFactorRateLimit: {
        deleteMany: vi.fn(),
      },
      webAuthnCredential: {
        count: vi.fn(),
        deleteMany: vi.fn(),
      },
      webAuthnChallenge: {
        deleteMany: vi.fn(),
      },
    },
    transaction: vi.fn(),
  },
}));

const parseRequestMock = vi.mocked(parseRequest);
const canEnforceTwoFactorAuthForUserMock = vi.mocked(canEnforceTwoFactorAuthForUser);
const isTwoFactorConfiguredMock = vi.mocked(isTwoFactorConfigured);
const updateUserMock = vi.mocked(updateUser);
const prismaMock = prisma as unknown as {
  client: {
    twoFactorAuth: {
      findUnique: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
    twoFactorBackupCode: { deleteMany: ReturnType<typeof vi.fn> };
    twoFactorOtpUsed: { deleteMany: ReturnType<typeof vi.fn> };
    twoFactorRateLimit: { deleteMany: ReturnType<typeof vi.fn> };
    webAuthnCredential: {
      count: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
    webAuthnChallenge: { deleteMany: ReturnType<typeof vi.fn> };
  };
  transaction: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  parseRequestMock.mockReset();
  canEnforceTwoFactorAuthForUserMock.mockReset();
  isTwoFactorConfiguredMock.mockReset();
  updateUserMock.mockReset();
  prismaMock.client.twoFactorAuth.findUnique.mockReset();
  prismaMock.client.twoFactorAuth.deleteMany.mockReset();
  prismaMock.client.twoFactorBackupCode.deleteMany.mockReset();
  prismaMock.client.twoFactorOtpUsed.deleteMany.mockReset();
  prismaMock.client.twoFactorRateLimit.deleteMany.mockReset();
  prismaMock.client.webAuthnCredential.count.mockReset();
  prismaMock.client.webAuthnCredential.deleteMany.mockReset();
  prismaMock.client.webAuthnChallenge.deleteMany.mockReset();
  prismaMock.transaction.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'admin-1',
        isAdmin: true,
      },
    },
    error: undefined,
  });
  canEnforceTwoFactorAuthForUserMock.mockResolvedValue(true);
  isTwoFactorConfiguredMock.mockReturnValue(true);
});

test('GET returns whether 2FA is enabled for the target user', async () => {
  prismaMock.client.twoFactorAuth.findUnique.mockResolvedValue({
    userId: 'user-1',
    isEnabled: true,
  } as any);
  prismaMock.client.webAuthnCredential.count.mockResolvedValue(2);

  const response = await GET(new Request('http://localhost/api/admin/users/user-1/2fa'), {
    params: Promise.resolve({ userId: 'user-1' }),
  });

  await expect(response.json()).resolves.toEqual({ isEnabled: true, securityKeyCount: 2 });
  expect(response.status).toBe(200);
});

test('POST updates the user-level 2FA requirement flag', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'admin-1',
        isAdmin: true,
      },
    },
    body: {
      required: true,
    },
    error: undefined,
  });
  updateUserMock.mockResolvedValue({ id: 'user-1' } as any);

  const response = await POST(new Request('http://localhost/api/admin/users/user-1/2fa', { method: 'POST' }), {
    params: Promise.resolve({ userId: 'user-1' }),
  });

  expect(updateUserMock).toHaveBeenCalledWith('user-1', { twoFactorRequired: true });
  await expect(response.json()).resolves.toEqual({
    ok: true,
    userId: 'user-1',
    twoFactorRequired: true,
  });
  expect(response.status).toBe(200);
});

test('POST rejects enabling a user-level 2FA requirement when the encryption key is missing', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'admin-1',
        isAdmin: true,
      },
    },
    body: {
      required: true,
    },
    error: undefined,
  });
  isTwoFactorConfiguredMock.mockReturnValue(false);

  const response = await POST(new Request('http://localhost/api/admin/users/user-1/2fa', { method: 'POST' }), {
    params: Promise.resolve({ userId: 'user-1' }),
  });

  expect(updateUserMock).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-not-configured',
    },
  });
  expect(response.status).toBe(503);
});

test('DELETE clears the user 2FA configuration and related support tables', async () => {
  prismaMock.client.twoFactorAuth.deleteMany.mockResolvedValue({ count: 1 } as any);
  prismaMock.client.twoFactorBackupCode.deleteMany.mockResolvedValue({ count: 8 } as any);
  prismaMock.client.twoFactorOtpUsed.deleteMany.mockResolvedValue({ count: 2 } as any);
  prismaMock.client.twoFactorRateLimit.deleteMany.mockResolvedValue({ count: 1 } as any);
  prismaMock.client.webAuthnCredential.deleteMany.mockResolvedValue({ count: 3 } as any);
  prismaMock.client.webAuthnChallenge.deleteMany.mockResolvedValue({ count: 1 } as any);
  prismaMock.transaction.mockImplementation(async operations => Promise.all(operations));

  const response = await DELETE(
    new Request('http://localhost/api/admin/users/user-1/2fa', { method: 'DELETE' }),
    {
      params: Promise.resolve({ userId: 'user-1' }),
    },
  );

  expect(prismaMock.client.twoFactorAuth.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  expect(prismaMock.client.twoFactorBackupCode.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  expect(prismaMock.client.twoFactorOtpUsed.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  expect(prismaMock.client.twoFactorRateLimit.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  expect(prismaMock.client.webAuthnCredential.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  expect(prismaMock.client.webAuthnChallenge.deleteMany).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
  });
  await expect(response.json()).resolves.toEqual({
    ok: true,
    userId: 'user-1',
    reset: {
      twoFactorAuth: 1,
      backupCodes: 8,
      otpUsed: 2,
      rateLimit: 1,
      securityKeys: 3,
    },
  });
  expect(response.status).toBe(200);
});
