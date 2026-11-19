import { beforeEach, describe, expect, test, vi } from 'vitest';
import { reserveAttempt } from './rate-limit';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: { transaction: mocks.transaction },
}));

const tx = {
  twoFactorRateLimit: { findUnique: mocks.findUnique, upsert: mocks.upsert, update: mocks.update },
};

const prismaError = (code: string) => Object.assign(new Error(code), { code });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.transaction.mockImplementation(fn => fn(tx));
  mocks.findUnique.mockResolvedValue(null);
  mocks.upsert.mockResolvedValue({ attempts: 1 });
});

describe('reserveAttempt', () => {
  test('allows and counts an attempt below the limit', async () => {
    await expect(reserveAttempt('user-1')).resolves.toEqual({ allowed: true });
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      update: { attempts: { increment: 1 } },
      create: { userId: 'user-1', attempts: 1 },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  test('locks on the attempt that reaches the limit', async () => {
    mocks.upsert.mockResolvedValue({ attempts: 5 });

    const result = await reserveAttempt('user-1');

    expect(result).toEqual({ allowed: true, lockedUntil: expect.any(Date) });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { lockedUntil: result.lockedUntil },
    });
  });

  test('denies while locked without counting, so the guess is never checked', async () => {
    const lockedUntil = new Date(Date.now() + 60_000);
    mocks.findUnique.mockResolvedValue({ attempts: 5, lockedUntil });

    await expect(reserveAttempt('user-1')).resolves.toEqual({ allowed: false, lockedUntil });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  test('allows one attempt after the lock expires and locks again if it is not reset', async () => {
    mocks.findUnique.mockResolvedValue({ attempts: 5, lockedUntil: new Date(Date.now() - 1) });
    mocks.upsert.mockResolvedValue({ attempts: 6 });

    await expect(reserveAttempt('user-1')).resolves.toEqual({
      allowed: true,
      lockedUntil: expect.any(Date),
    });
  });

  test('retries serialization conflicts from concurrent attempts', async () => {
    mocks.transaction.mockRejectedValueOnce(prismaError('P2034')).mockImplementation(fn => fn(tx));

    await expect(reserveAttempt('user-1')).resolves.toEqual({ allowed: true });
    expect(mocks.transaction).toHaveBeenCalledTimes(2);
  });

  test('fails closed when retries are exhausted instead of letting the guess through uncounted', async () => {
    mocks.transaction.mockRejectedValue(prismaError('P2034'));

    await expect(reserveAttempt('user-1')).resolves.toEqual({ allowed: false });
    expect(mocks.transaction).toHaveBeenCalledTimes(3);
  });

  test('rethrows unrelated database errors', async () => {
    mocks.transaction.mockRejectedValue(prismaError('P1001'));

    await expect(reserveAttempt('user-1')).rejects.toThrow('P1001');
  });
});
