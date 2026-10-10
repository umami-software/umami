import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getEntity } from '@/lib/entity';
import { getTeamUser } from '@/queries/prisma';
import { canDeleteEntity, canUpdateEntity, canViewEntity } from './entity';

vi.mock('@/lib/entity', () => ({
  getEntity: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
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
  vi.mocked(getEntity).mockReset();
  vi.mocked(getTeamUser).mockReset();
});

describe('canViewEntity', () => {
  test('denies when there is no user', async () => {
    await expect(canViewEntity({}, 'entity-1')).resolves.toBe(false);
    expect(getEntity).not.toHaveBeenCalled();
  });

  test('allows admins without a lookup', async () => {
    await expect(canViewEntity({ user: adminUser }, 'entity-1')).resolves.toBe(true);
    expect(getEntity).not.toHaveBeenCalled();
  });

  test('denies when the entity is missing', async () => {
    vi.mocked(getEntity).mockResolvedValue(null as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned entity', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies a non-owner of a user-owned entity', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'other' } as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });

  test('allows any member of the owning team', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies a non-member of the owning team', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue(null as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });

  test('denies when the entity has neither userId nor teamId', async () => {
    vi.mocked(getEntity).mockResolvedValue({} as any);
    await expect(canViewEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });
});

describe('canUpdateEntity', () => {
  test('denies when there is no user', async () => {
    await expect(canUpdateEntity({}, 'entity-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canUpdateEntity({ user: adminUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies when the entity is missing', async () => {
    vi.mocked(getEntity).mockResolvedValue(null as any);
    await expect(canUpdateEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned entity', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canUpdateEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('allows a team member with website:update', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canUpdateEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canUpdateEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });
});

describe('canDeleteEntity', () => {
  test('denies when there is no user', async () => {
    await expect(canDeleteEntity({}, 'entity-1')).resolves.toBe(false);
  });

  test('allows admins', async () => {
    await expect(canDeleteEntity({ user: adminUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies when the entity is missing', async () => {
    vi.mocked(getEntity).mockResolvedValue(null as any);
    await expect(canDeleteEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });

  test('allows the owner of a user-owned entity', async () => {
    vi.mocked(getEntity).mockResolvedValue({ userId: 'user-1' } as any);
    await expect(canDeleteEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('allows a team member with website:delete', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-member' } as any);
    await expect(canDeleteEntity({ user: normalUser }, 'entity-1')).resolves.toBe(true);
  });

  test('denies a team-view-only member', async () => {
    vi.mocked(getEntity).mockResolvedValue({ teamId: 'team-1' } as any);
    vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);
    await expect(canDeleteEntity({ user: normalUser }, 'entity-1')).resolves.toBe(false);
  });
});
