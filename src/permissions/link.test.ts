import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getLink, getTeamUser } from '@/queries/prisma';
import { canDeleteLink, canUpdateLink, canViewLink } from './link';

vi.mock('@/queries/prisma', () => ({
  getLink: vi.fn(),
  getTeamUser: vi.fn(),
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

beforeEach(() => {
  vi.mocked(getLink).mockReset();
  vi.mocked(getTeamUser).mockReset();
});

describe('canViewLink', () => {
  test('allows admins without a lookup', async () => {
    await expect(canViewLink({ user: adminUser }, 'link-1')).resolves.toBe(true);
    expect(getLink).not.toHaveBeenCalled();
  });

  test('allows a matching linkId share token', async () => {
    await expect(canViewLink({ shareToken: { linkId: 'link-1' } as any }, 'link-1')).resolves.toBe(
      true,
    );
  });

  test('allows a matching websiteId share token', async () => {
    await expect(
      canViewLink({ shareToken: { websiteId: 'link-1' } as any }, 'link-1'),
    ).resolves.toBe(true);
  });

  test('allows a link id in the share token list', async () => {
    await expect(
      canViewLink({ shareToken: { linkIds: ['link-1'] } as any }, 'link-1'),
    ).resolves.toBe(true);
  });

  test('denies when there is no user and no matching token', async () => {
    await expect(canViewLink({}, 'link-1')).resolves.toBe(false);
    expect(getLink).not.toHaveBeenCalled();
  });

  test('denies when the link is missing', async () => {
    vi.mocked(getLink).mockResolvedValue(null as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned link', async () => {
    vi.mocked(getLink).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies a non-owner of a user-owned link', async () => {
    vi.mocked(getLink).mockResolvedValue({ userId: 'other' } as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });

  test('allows any member of the owning team', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies a non-member of the owning team', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue(null as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });

  test('denies when the link has neither userId nor teamId', async () => {
    vi.mocked(getLink).mockResolvedValue({} as any);
    await expect(canViewLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });
});

describe('canUpdateLink', () => {
  test('denies when there is no user', async () => {
    await expect(canUpdateLink({}, 'link-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canUpdateLink({ user: adminUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies when the link is missing', async () => {
    vi.mocked(getLink).mockResolvedValue(null as any);
    await expect(canUpdateLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned link', async () => {
    vi.mocked(getLink).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canUpdateLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('allows a team member with website:update', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canUpdateLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canUpdateLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });
});

describe('canDeleteLink', () => {
  test('denies when there is no user', async () => {
    await expect(canDeleteLink({}, 'link-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canDeleteLink({ user: adminUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies when the link is missing', async () => {
    vi.mocked(getLink).mockResolvedValue(null as any);
    await expect(canDeleteLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned link', async () => {
    vi.mocked(getLink).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canDeleteLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('allows a team member with website:delete', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canDeleteLink({ user: normalUser }, 'link-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getLink).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canDeleteLink({ user: normalUser }, 'link-1')).resolves.toBe(false);
  });
});
