import { beforeEach, describe, expect, test, vi } from 'vitest';
import { deleteSecurityKey } from './securityKey';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  count: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    transaction: mocks.transaction,
  },
}));

const tx = {
  webAuthnCredential: {
    count: mocks.count,
    deleteMany: mocks.deleteMany,
  },
};

describe('deleteSecurityKey', () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) {
      mock.mockReset();
    }

    mocks.transaction.mockImplementation(async (callback, options) => {
      expect(options).toEqual({ isolationLevel: 'Serializable' });
      return callback(tx);
    });
    mocks.count.mockResolvedValue(2);
    mocks.deleteMany.mockResolvedValue({ count: 1 });
  });

  test('deletes a key owned by the user', async () => {
    await expect(deleteSecurityKey('key-1', 'user-1')).resolves.toBe('deleted');

    expect(mocks.count).not.toHaveBeenCalled();
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { id: 'key-1', userId: 'user-1' } });
  });

  test('reports a key that does not belong to the user', async () => {
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    await expect(deleteSecurityKey('key-1', 'user-1')).resolves.toBe('not-found');
  });

  test('keeps the last key when asked to', async () => {
    mocks.count.mockResolvedValue(1);

    await expect(deleteSecurityKey('key-1', 'user-1', { keepLastKey: true })).resolves.toBe(
      'last-key',
    );
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  test('deletes one of several keys when keeping the last key', async () => {
    await expect(deleteSecurityKey('key-1', 'user-1', { keepLastKey: true })).resolves.toBe(
      'deleted',
    );
  });

  test('retries when a concurrent delete causes a serialization failure', async () => {
    mocks.transaction.mockRejectedValueOnce(
      Object.assign(new Error('conflict'), { code: 'P2034' }),
    );
    mocks.count.mockResolvedValue(1);

    await expect(deleteSecurityKey('key-1', 'user-1', { keepLastKey: true })).resolves.toBe(
      'last-key',
    );
    expect(mocks.transaction).toHaveBeenCalledTimes(2);
  });

  test('retries a serialization failure reported by the driver adapter', async () => {
    mocks.transaction.mockRejectedValueOnce(
      Object.assign(new Error('TransactionWriteConflict'), {
        cause: { originalCode: '40001', kind: 'TransactionWriteConflict' },
      }),
    );

    await expect(deleteSecurityKey('key-1', 'user-1')).resolves.toBe('deleted');
    expect(mocks.transaction).toHaveBeenCalledTimes(2);
  });

  test('gives up after repeated serialization failures', async () => {
    mocks.transaction.mockRejectedValue(Object.assign(new Error('conflict'), { code: 'P2034' }));

    await expect(deleteSecurityKey('key-1', 'user-1')).rejects.toThrow('conflict');
    expect(mocks.transaction).toHaveBeenCalledTimes(3);
  });
});
