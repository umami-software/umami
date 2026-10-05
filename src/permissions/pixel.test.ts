import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getPixel, getTeamUser } from '@/queries/prisma';
import { canDeletePixel, canUpdatePixel, canViewPixel } from './pixel';

vi.mock('@/queries/prisma', () => ({
  getPixel: vi.fn(),
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
  vi.mocked(getPixel).mockReset();
  vi.mocked(getTeamUser).mockReset();
});

describe('canViewPixel', () => {
  test('allows admins without a lookup', async () => {
    await expect(canViewPixel({ user: adminUser }, 'pixel-1')).resolves.toBe(true);
    expect(getPixel).not.toHaveBeenCalled();
  });

  test('allows a matching pixelId share token', async () => {
    await expect(
      canViewPixel({ shareToken: { pixelId: 'pixel-1' } as any }, 'pixel-1'),
    ).resolves.toBe(true);
  });

  test('allows a matching websiteId share token', async () => {
    await expect(
      canViewPixel({ shareToken: { websiteId: 'pixel-1' } as any }, 'pixel-1'),
    ).resolves.toBe(true);
  });

  test('allows a pixel id in the share token list', async () => {
    await expect(
      canViewPixel({ shareToken: { pixelIds: ['pixel-1'] } as any }, 'pixel-1'),
    ).resolves.toBe(true);
  });

  test('denies when there is no user and no matching token', async () => {
    await expect(canViewPixel({}, 'pixel-1')).resolves.toBe(false);
    expect(getPixel).not.toHaveBeenCalled();
  });

  test('denies when the pixel is missing', async () => {
    vi.mocked(getPixel).mockResolvedValue(null as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned pixel', async () => {
    vi.mocked(getPixel).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies a non-owner of a user-owned pixel', async () => {
    vi.mocked(getPixel).mockResolvedValue({ userId: 'other' } as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });

  test('allows any member of the owning team', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies a non-member of the owning team', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue(null as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });

  test('denies when the pixel has neither userId nor teamId', async () => {
    vi.mocked(getPixel).mockResolvedValue({} as any);
    await expect(canViewPixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });
});

describe('canUpdatePixel', () => {
  test('denies when there is no user', async () => {
    await expect(canUpdatePixel({}, 'pixel-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canUpdatePixel({ user: adminUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies when the pixel is missing', async () => {
    vi.mocked(getPixel).mockResolvedValue(null as any);
    await expect(canUpdatePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned pixel', async () => {
    vi.mocked(getPixel).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canUpdatePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('allows a team member with website:update', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canUpdatePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canUpdatePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });
});

describe('canDeletePixel', () => {
  test('denies when there is no user', async () => {
    await expect(canDeletePixel({}, 'pixel-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canDeletePixel({ user: adminUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies when the pixel is missing', async () => {
    vi.mocked(getPixel).mockResolvedValue(null as any);
    await expect(canDeletePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned pixel', async () => {
    vi.mocked(getPixel).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canDeletePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('allows a team member with website:delete', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canDeletePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getPixel).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canDeletePixel({ user: normalUser }, 'pixel-1')).resolves.toBe(false);
  });
});
