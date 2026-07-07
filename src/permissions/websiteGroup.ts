import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getTeamUser, getWebsiteGroup } from '@/queries/prisma';

export async function canViewWebsiteGroup({ user }: Auth, groupId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const group = await getWebsiteGroup(groupId);

  if (!group) {
    return false;
  }

  if (group.userId) {
    return user.id === group.userId;
  }

  if (group.teamId) {
    const teamUser = await getTeamUser(group.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canCreateWebsiteGroup({ user }: Auth) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return hasPermission(user.role, PERMISSIONS.websiteCreate);
}

export async function canCreateTeamWebsiteGroup({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteCreate);
}

export async function canUpdateWebsiteGroup({ user }: Auth, groupId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const group = await getWebsiteGroup(groupId);

  if (!group) {
    return false;
  }

  if (group.userId) {
    return user.id === group.userId;
  }

  if (group.teamId) {
    const teamUser = await getTeamUser(group.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsiteGroup({ user }: Auth, groupId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const group = await getWebsiteGroup(groupId);

  if (!group) {
    return false;
  }

  if (group.userId) {
    return user.id === group.userId;
  }

  if (group.teamId) {
    const teamUser = await getTeamUser(group.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
