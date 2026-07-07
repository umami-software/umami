import { beforeEach, describe, expect, test, vi } from 'vitest';

const {
  websiteGroupFindMany,
  websiteGroupFindUnique,
  websiteUpdateMany,
  websiteGroupUpdateMany,
  websiteGroupDeleteMany,
  websiteGroupDelete,
  transaction,
} = vi.hoisted(() => ({
  websiteGroupFindMany: vi.fn(),
  websiteGroupFindUnique: vi.fn(),
  websiteUpdateMany: vi.fn(),
  websiteGroupUpdateMany: vi.fn(),
  websiteGroupDeleteMany: vi.fn(),
  websiteGroupDelete: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      websiteGroup: {
        findMany: websiteGroupFindMany,
        findUnique: websiteGroupFindUnique,
        updateMany: websiteGroupUpdateMany,
        deleteMany: websiteGroupDeleteMany,
        delete: websiteGroupDelete,
      },
      website: {
        updateMany: websiteUpdateMany,
      },
    },
    transaction,
  },
}));

vi.mock('@/lib/websiteTree', () => ({
  buildWebsiteTree: vi.fn(),
}));

vi.mock('@/lib/sort', () => ({
  sanitizeSortFilters: vi.fn(),
}));

import { deleteWebsiteGroup, getWebsiteGroupDeletionSteps } from './websiteGroup';

describe('getWebsiteGroupDeletionSteps', () => {
  beforeEach(() => {
    websiteGroupFindMany.mockReset();
    websiteUpdateMany.mockReset();
    websiteGroupUpdateMany.mockReset();
    websiteGroupDeleteMany.mockReset();

    websiteGroupFindMany.mockResolvedValue([]);
    websiteUpdateMany.mockReturnValue('website-update');
    websiteGroupUpdateMany.mockReturnValue('group-update');
    websiteGroupDeleteMany.mockReturnValue('group-delete');
  });

  test('returns no steps when owner has no groups', async () => {
    await expect(getWebsiteGroupDeletionSteps({ userId: 'user-1' })).resolves.toEqual([]);

    expect(websiteGroupFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { id: true },
    });
    expect(websiteUpdateMany).not.toHaveBeenCalled();
  });

  test('clears website references and parent hierarchy before deleting groups', async () => {
    websiteGroupFindMany.mockResolvedValue([{ id: 'g1' }, { id: 'g2' }]);

    const steps = await getWebsiteGroupDeletionSteps({ teamId: 'team-1' });

    expect(steps).toHaveLength(3);
    expect(websiteUpdateMany).toHaveBeenCalledWith({
      where: { groupId: { in: ['g1', 'g2'] } },
      data: { groupId: null },
    });
    expect(websiteGroupUpdateMany).toHaveBeenCalledWith({
      where: { teamId: 'team-1' },
      data: { parentId: null },
    });
    expect(websiteGroupDeleteMany).toHaveBeenCalledWith({
      where: { teamId: 'team-1' },
    });
  });

  test('does not filter out soft-deleted websites when clearing group references', async () => {
    websiteGroupFindMany.mockResolvedValue([{ id: 'g1' }]);

    await getWebsiteGroupDeletionSteps({ userId: 'user-1' });

    expect(websiteUpdateMany).toHaveBeenCalledWith({
      where: { groupId: { in: ['g1'] } },
      data: { groupId: null },
    });
    expect(websiteUpdateMany.mock.calls[0][0].where).not.toHaveProperty('deletedAt');
  });
});

describe('deleteWebsiteGroup', () => {
  beforeEach(() => {
    websiteGroupFindUnique.mockReset();
    websiteUpdateMany.mockReset();
    websiteGroupUpdateMany.mockReset();
    websiteGroupDelete.mockReset();
    transaction.mockReset();

    websiteGroupFindUnique.mockResolvedValue({
      id: 'g1',
      parentId: 'g0',
    });
    websiteUpdateMany.mockReturnValue('website-update');
    websiteGroupUpdateMany.mockReturnValue('group-update');
    websiteGroupDelete.mockReturnValue('group-delete');
    transaction.mockResolvedValue(['website-update', 'group-update', 'group-delete']);
  });

  test('clears group references on soft-deleted websites when reparenting', async () => {
    await deleteWebsiteGroup('g1');

    expect(websiteUpdateMany).toHaveBeenCalledWith({
      where: { groupId: 'g1' },
      data: { groupId: 'g0' },
    });
    expect(websiteUpdateMany.mock.calls[0][0].where).not.toHaveProperty('deletedAt');
    expect(transaction).toHaveBeenCalledWith([
      'group-update',
      'website-update',
      'group-delete',
    ]);
  });
});
