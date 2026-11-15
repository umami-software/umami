import { beforeEach, describe, expect, test, vi } from 'vitest';
import { deletePixel, updatePixel } from './pixel';

const { findUniqueMock, updateMock, deleteMock, redisDelMock, redisState } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
  redisDelMock: vi.fn(),
  redisState: { enabled: true },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      pixel: {
        findUnique: findUniqueMock,
        update: updateMock,
        delete: deleteMock,
      },
    },
  },
}));

vi.mock('@/lib/redis', () => ({
  default: {
    get enabled() {
      return redisState.enabled;
    },
    client: {
      del: redisDelMock,
    },
  },
}));

describe('pixel cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisState.enabled = true;
  });

  test('updatePixel drops the cached pixel under the old and the new slug', async () => {
    findUniqueMock.mockResolvedValue({ id: 'p1', slug: 'old' });
    updateMock.mockResolvedValue({ id: 'p1', slug: 'new', name: 'a' });

    await updatePixel('p1', { slug: 'new' });

    expect(redisDelMock).toHaveBeenCalledWith('pixel:old');
    expect(redisDelMock).toHaveBeenCalledWith('pixel:new');
    expect(redisDelMock).toHaveBeenCalledTimes(2);
  });

  test('updatePixel drops the cached pixel once when the slug is unchanged', async () => {
    findUniqueMock.mockResolvedValue({ id: 'p1', slug: 'same' });
    updateMock.mockResolvedValue({ id: 'p1', slug: 'same', name: 'b' });

    await updatePixel('p1', { name: 'b' });

    expect(redisDelMock).toHaveBeenCalledTimes(1);
    expect(redisDelMock).toHaveBeenCalledWith('pixel:same');
  });

  test('deletePixel drops the cached pixel', async () => {
    deleteMock.mockResolvedValue({ id: 'p1', slug: 'gone' });

    await deletePixel('p1');

    expect(redisDelMock).toHaveBeenCalledWith('pixel:gone');
  });

  test('nothing is touched in Redis when it is not enabled', async () => {
    redisState.enabled = false;
    updateMock.mockResolvedValue({ id: 'p1', slug: 'x' });
    deleteMock.mockResolvedValue({ id: 'p1', slug: 'x' });

    await updatePixel('p1', { name: 'a' });
    await deletePixel('p1');

    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(redisDelMock).not.toHaveBeenCalled();
  });
});
