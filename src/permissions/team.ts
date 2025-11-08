import { Auth } from '@/lib/types';
import { PERMISSIONS } from '@/lib/constants';
import { getTeamUser } from '@/queries/prisma';
import { hasPermission } from '@/lib/auth';

export async function canViewTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  return getTeamUser(teamId, user.id);
}

export async function canCreateTeam({ user }: Auth) {
  if (user.isAdmin) {
    return true;
  }

  return !!user;
}

export async function canUpdateTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
}

export async function canDeleteTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.teamDelete);
}

export async function canDeleteTeamUser({ user }: Auth, teamId: string, removeUserId: string) {
  if (user.isAdmin) {
    return true;
  }

  if (removeUserId === user.id) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
}

export async function canCreateTeamWebsite({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteCreate);
}

export async function canViewAllTeams({ user }: Auth) {
  return user.isAdmin;
}
