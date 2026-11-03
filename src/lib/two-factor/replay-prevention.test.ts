import { beforeEach, describe, expect, test, vi } from 'vitest';
import { claimOtp } from './replay-prevention';

const mocks = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorOtpUsed: {
        deleteMany: mocks.deleteMany,
        create: mocks.create,
      },
    },
  },
}));

beforeEach(() => {
  mocks.deleteMany.mockReset().mockResolvedValue({ count: 0 });
  mocks.create.mockReset().mockResolvedValue({});
});

describe('claimOtp', () => {
  test('claims an unused code', async () => {
    await expect(claimOtp('user-1', '123456')).resolves.toBe(true);
    expect(mocks.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', otp: '123456', expiresAt: expect.any(Date) },
    });
  });

  test('rejects a code already claimed by a concurrent request', async () => {
    // The unique (userId, otp) index is what makes the claim atomic: the losing insert fails
    // with P2002 instead of both requests passing a separate "already used?" lookup.
    mocks.create.mockRejectedValue(
      Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
    );

    await expect(claimOtp('user-1', '123456')).resolves.toBe(false);
  });

  test('clears an expired claim first so the code can be used again later', async () => {
    await claimOtp('user-1', '123456');

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', otp: '123456', expiresAt: { lt: expect.any(Date) } },
    });
    expect(mocks.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.create.mock.invocationCallOrder[0],
    );
  });

  test('rethrows unrelated database errors instead of treating them as a replay', async () => {
    mocks.create.mockRejectedValue(Object.assign(new Error('Connection lost'), { code: 'P1001' }));

    await expect(claimOtp('user-1', '123456')).rejects.toThrow('Connection lost');
  });
});
