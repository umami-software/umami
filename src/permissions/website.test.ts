import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getEntity } from '@/lib/entity';
import { getTeamUser, getWebsite } from '@/queries/prisma';
import {
  canCreateWebsite,
  canDeleteWebsite,
  canTransferWebsiteToTeam,
  canTransferWebsiteToUser,
  canUpdateWebsite,
  canViewAllWebsites,
  canViewBatchWebsites,
  canViewWebsite,
} from './website';

const { websiteFindManyMock, teamUserFindManyMock } = vi.hoisted(() => ({
  websiteFindManyMock: vi.fn(),
  teamUserFindManyMock: vi.fn(),
}));

vi.mock('@/lib/entity', () => ({
  getEntity: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsite: vi.fn(),
  getTeamUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      website: {
        findMany: websiteFindManyMock,
      },
      teamUser: {
        findMany: teamUserFindManyMock,
      },
    },
  },
}));

vi.mock('@/lib/auth', async () => {
  const { ROLE_PERMISSIONS } = await import('@/lib/constants');

  return {
    hasPermission: (role: string, permission: string | string[]) =>
      (Array.isArray(permission) ? permission : [permission]).some(p =>
        ROLE_PERMISSIONS[role]?.includes(p),
      ),
  };
});

const adminUser = { id: 'admin-1', username: 'admin', role: 'admin', isAdmin: true };
const normalUser = { id: 'user-1', username: 'user', role: 'user', isAdmin: false };
const viewOnlyUser = { id: 'user-2', username: 'viewer', role: 'view-only', isAdmin: false };

beforeEach(() => {
  vi.mocked(getEntity).mockReset();
  vi.mocked(getWebsite).mockReset();
  vi.mocked(getTeamUser).mockReset();
  websiteFindManyMock.mockReset();
  teamUserFindManyMock.mockReset();
});

describe('canViewWebsite', () => {
  test('allows admins without any lookup', async () => {
    await expect(canViewWebsite({ user: adminUser }, 'website-1')).resolves.toBe(true);
    expect(getEntity).not.toHaveBeenCalled();
  });

  test('allows a matching single share token id', async () => {
    await expect(
      canViewWebsite({ shareToken: { websiteId: 'website-1' } as any }, 'website-1'),
    ).resolves.toBe(true);
  });

  test('allows a website id present in share token list ids', async () => {
    await expect(
      canViewWebsite({ shareToken: { websiteIds: ['website-1'] } as any }, 'website-1'),
    ).resolves.toBe(true);
  });

  test('allows a pixel share token to view the matching id', async () => {
    await expect(
      canViewWebsite({ shareToken: { pixelId: 'website-1' } as any }, 'website-1'),
    ).resolves.toBe(true);
  });

  test('denies when entity is missing', async () => {
    vi.mocked(getEntity).mockResolvedValue(null as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('denies when there is no user and no matching share token', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canViewWebsite({}, 'website-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned website', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies a non-owner of a user-owned website', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'other-user' } as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('allows a member of the owning team', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies a non-member of the owning team', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue(null as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('denies when entity has neither userId nor teamId', async () => {
    vi.mocked(getEntity).mockResolvedValue({} as any);
    await expect(canViewWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });
});

describe('canViewBatchWebsites', () => {
  test('returns empty array for empty input', async () => {
    await expect(canViewBatchWebsites({ user: normalUser }, [])).resolves.toEqual([]);
  });

  test('returns all deduped ids for admins', async () => {
    await expect(canViewBatchWebsites({ user: adminUser }, ['a', 'a', 'b'])).resolves.toEqual([
      'a',
      'b',
    ]);
  });

  test('returns only share-allowed ids when there is no user', async () => {
    await expect(
      canViewBatchWebsites({ shareToken: { websiteIds: ['a'] } as any }, ['a', 'b']),
    ).resolves.toEqual(['a']);
  });

  test('returns owned, team, and share allowed ids for a user', async () => {
    websiteFindManyMock.mockResolvedValue([
      { id: 'owned', userId: 'user-1', teamId: null },
      { id: 'team', userId: null, teamId: 'team-1' },
      { id: 'foreign', userId: 'other', teamId: null },
    ] as any);
    teamUserFindManyMock.mockResolvedValue([{ teamId: 'team-1' }] as any);

    await expect(
      canViewBatchWebsites({ user: normalUser, shareToken: { websiteId: 'shared' } as any }, [
        'owned',
        'team',
        'foreign',
        'shared',
      ]),
    ).resolves.toEqual(['owned', 'team', 'shared']);
  });

  test('excludes team websites when the user is not a team member', async () => {
    websiteFindManyMock.mockResolvedValue([
      { id: 'team', userId: null, teamId: 'team-1' },
    ] as any);
    teamUserFindManyMock.mockResolvedValue([] as any);

    await expect(canViewBatchWebsites({ user: normalUser }, ['team'])).resolves.toEqual([]);
  });
});

describe('canViewAllWebsites', () => {
  test('allows admins', async () => {
    await expect(canViewAllWebsites({ user: adminUser })).resolves.toBe(true);
  });

  test('denies non-admins', async () => {
    await expect(canViewAllWebsites({ user: normalUser })).resolves.toBe(false);
  });

  test('denies when there is no user', async () => {
    await expect(canViewAllWebsites({})).resolves.toBe(false);
  });
});

describe('canCreateWebsite', () => {
  test('denies when there is no user', async () => {
    await expect(canCreateWebsite({})).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canCreateWebsite({ user: adminUser })).resolves.toBe(true);
  });

  test('allows a user role', async () => {
    await expect(canCreateWebsite({ user: normalUser })).resolves.toBe(true);
  });

  test('denies a view-only role', async () => {
    await expect(canCreateWebsite({ user: viewOnlyUser })).resolves.toBe(false);
  });
});

describe('canUpdateWebsite', () => {
  test('denies when there is no user', async () => {
    await expect(canUpdateWebsite({}, 'website-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canUpdateWebsite({ user: adminUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies when website is missing', async () => {
    vi.mocked(getWebsite).mockResolvedValue(null as any);
    await expect(canUpdateWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned website', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canUpdateWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies a non-owner of a user-owned website', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'other' } as any);
    await expect(canUpdateWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('allows a team member with website:update permission', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canUpdateWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canUpdateWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });
});

describe('canDeleteWebsite', () => {
  test('denies when there is no user', async () => {
    await expect(canDeleteWebsite({}, 'website-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canDeleteWebsite({ user: adminUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies when website is missing', async () => {
    vi.mocked(getWebsite).mockResolvedValue(null as any);
    await expect(canDeleteWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned website', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canDeleteWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('allows a team member with website:delete permission', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canDeleteWebsite({ user: normalUser }, 'website-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canDeleteWebsite({ user: normalUser }, 'website-1')).resolves.toBe(false);
  });
});

describe('canTransferWebsiteToUser', () => {
  test('denies when there is no user', async () => {
    await expect(canTransferWebsiteToUser({}, 'website-1', 'user-1')).resolves.toBe(false);
  });

  test('denies when website is missing', async () => {
    vi.mocked(getWebsite).mockResolvedValue(null as any);
    await expect(
      canTransferWebsiteToUser({ user: normalUser }, 'website-1', 'user-1'),
    ).resolves.toBe(false);
  });

  test('allows admins without any lookup', async () => {
    await expect(
      canTransferWebsiteToUser({ user: adminUser }, 'website-1', 'admin-1'),
    ).resolves.toBe(true);
    expect(getWebsite).not.toHaveBeenCalled();
  });

  test('allows a team owner transferring a team website to themselves', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-owner' } as any);
    await expect(
      canTransferWebsiteToUser({ user: normalUser }, 'website-1', 'user-1'),
    ).resolves.toBe(true);
  });

  test('denies a team manager (lacks website:transfer-to-user)', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-manager' } as any);
    await expect(
      canTransferWebsiteToUser({ user: normalUser }, 'website-1', 'user-1'),
    ).resolves.toBe(false);
  });

  test('denies transferring to a different user id', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ teamId: 'team-1' } as any);
    await expect(
      canTransferWebsiteToUser({ user: normalUser }, 'website-1', 'other-user'),
    ).resolves.toBe(false);
  });
});

describe('canTransferWebsiteToTeam', () => {
  test('denies when there is no user', async () => {
    await expect(canTransferWebsiteToTeam({}, 'website-1', 'team-1')).resolves.toBe(false);
  });

  test('allows admins without any lookup', async () => {
    await expect(
      canTransferWebsiteToTeam({ user: adminUser }, 'website-1', 'team-1'),
    ).resolves.toBe(true);
    expect(getWebsite).not.toHaveBeenCalled();
  });

  test('denies when website is missing', async () => {
    vi.mocked(getWebsite).mockResolvedValue(null as any);
    await expect(
      canTransferWebsiteToTeam({ user: normalUser }, 'website-1', 'team-1'),
    ).resolves.toBe(false);
  });

  test('allows an owner who is a team owner of the destination team', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'user-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-owner' } as any);
    await expect(
      canTransferWebsiteToTeam({ user: normalUser }, 'website-1', 'team-1'),
    ).resolves.toBe(true);
  });

  test('allows an owner who is a team manager of the destination team', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'user-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-manager' } as any);
    await expect(
      canTransferWebsiteToTeam({ user: normalUser }, 'website-1', 'team-1'),
    ).resolves.toBe(true);
  });

  test('denies a team member of the destination team', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'user-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(
      canTransferWebsiteToTeam({ user: normalUser }, 'website-1', 'team-1'),
    ).resolves.toBe(false);
  });

  test('denies when the website is not owned by the user', async () => {
    vi.mocked(getWebsite).mockResolvedValue({ userId: 'other' } as any);
    await expect(
      canTransferWebsiteToTeam({ user: normalUser }, 'website-1', 'team-1'),
    ).resolves.toBe(false);
  });
});
