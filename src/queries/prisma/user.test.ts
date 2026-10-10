import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getUserByUsername } from './user';

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      user: {
        findUnique: findUniqueMock,
      },
    },
  },
}));

describe('getUserByUsername', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    findUniqueMock.mockResolvedValue(null);
  });

  test('normalizes usernames to lowercase before lookup', async () => {
    await getUserByUsername('KaKi87', { includePassword: true });

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        username: 'kaki87',
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        createdAt: true,
        twoFactorRequired: true,
      },
    });
  });

  test('can include deleted users while still lowercasing the username', async () => {
    await getUserByUsername('KaKi87', { showDeleted: true });

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        username: 'kaki87',
      },
      select: {
        id: true,
        username: true,
        password: false,
        role: true,
        createdAt: true,
        twoFactorRequired: true,
      },
    });
  });
});
