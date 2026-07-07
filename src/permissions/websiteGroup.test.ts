import { beforeEach, expect, test, vi } from 'vitest';
import {
  canCreateTeamWebsiteGroup,
  canCreateWebsiteGroup,
  canDeleteWebsiteGroup,
  canUpdateWebsiteGroup,
  canViewWebsiteGroup,
} from './websiteGroup';

vi.mock('@/queries/prisma', () => ({
  getWebsiteGroup: vi.fn(),
  getTeamUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {},
}));

import { getTeamUser, getWebsiteGroup } from '@/queries/prisma';

const userAuth = {
  user: {
    id: 'user-1',
    username: 'user',
    role: 'user',
    isAdmin: false,
  },
};

const adminAuth = {
  user: {
    id: 'admin-1',
    username: 'admin',
    role: 'admin',
    isAdmin: true,
  },
};

beforeEach(() => {
  vi.mocked(getWebsiteGroup).mockReset();
  vi.mocked(getTeamUser).mockReset();
});

test('canViewWebsiteGroup allows owner', async () => {
  vi.mocked(getWebsiteGroup).mockResolvedValue({
    id: 'g1',
    userId: 'user-1',
    teamId: null,
  } as any);

  await expect(canViewWebsiteGroup(userAuth, 'g1')).resolves.toBe(true);
});

test('canViewWebsiteGroup allows team member', async () => {
  vi.mocked(getWebsiteGroup).mockResolvedValue({
    id: 'g1',
    userId: null,
    teamId: 'team-1',
  } as any);
  vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);

  await expect(canViewWebsiteGroup(userAuth, 'g1')).resolves.toBe(true);
});

test('canCreateWebsiteGroup allows admin', async () => {
  await expect(canCreateWebsiteGroup(adminAuth)).resolves.toBe(true);
});

test('canUpdateWebsiteGroup denies non-owner', async () => {
  vi.mocked(getWebsiteGroup).mockResolvedValue({
    id: 'g1',
    userId: 'other-user',
    teamId: null,
  } as any);

  await expect(canUpdateWebsiteGroup(userAuth, 'g1')).resolves.toBe(false);
});

test('canDeleteWebsiteGroup allows team manager', async () => {
  vi.mocked(getWebsiteGroup).mockResolvedValue({
    id: 'g1',
    userId: null,
    teamId: 'team-1',
  } as any);
  vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-manager' } as any);

  await expect(canDeleteWebsiteGroup(userAuth, 'g1')).resolves.toBe(true);
});

test('canCreateTeamWebsiteGroup requires website create permission', async () => {
  vi.mocked(getTeamUser).mockResolvedValue({ role: 'team-view-only' } as any);

  await expect(canCreateTeamWebsiteGroup(userAuth, 'team-1')).resolves.toBe(false);
});
