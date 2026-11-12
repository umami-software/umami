import { beforeEach, describe, expect, test, vi } from 'vitest';
import { deleteLink, updateLink } from './link';

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
      link: {
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

describe('link cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisState.enabled = true;
  });

  test('updateLink drops the cached link under the old and the new slug', async () => {
    findUniqueMock.mockResolvedValue({ id: 'l1', slug: 'old' });
    updateMock.mockResolvedValue({ id: 'l1', slug: 'new', url: 'https://example.com' });

    await updateLink('l1', { slug: 'new' });

    expect(redisDelMock).toHaveBeenCalledWith('link:old');
    expect(redisDelMock).toHaveBeenCalledWith('link:new');
    expect(redisDelMock).toHaveBeenCalledTimes(2);
  });

  test('updateLink drops the cached link once when the slug is unchanged', async () => {
    findUniqueMock.mockResolvedValue({ id: 'l1', slug: 'same' });
    updateMock.mockResolvedValue({ id: 'l1', slug: 'same', url: 'https://example.com/2' });

    await updateLink('l1', { url: 'https://example.com/2' });

    expect(redisDelMock).toHaveBeenCalledTimes(1);
    expect(redisDelMock).toHaveBeenCalledWith('link:same');
  });

  test('deleteLink drops the cached link', async () => {
    deleteMock.mockResolvedValue({ id: 'l1', slug: 'gone' });

    await deleteLink('l1');

    expect(redisDelMock).toHaveBeenCalledWith('link:gone');
  });

  test('nothing is touched in Redis when it is not enabled', async () => {
    redisState.enabled = false;
    updateMock.mockResolvedValue({ id: 'l1', slug: 'x' });
    deleteMock.mockResolvedValue({ id: 'l1', slug: 'x' });

    await updateLink('l1', { url: 'https://example.com' });
    await deleteLink('l1');

    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(redisDelMock).not.toHaveBeenCalled();
  });
});
