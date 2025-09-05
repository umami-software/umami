import { Auth } from '@/lib/types';
import { PERMISSIONS } from '@/lib/constants';
import { getTeamUser } from '@/queries';
import { hasPermission } from '@/lib/auth';

const cloudMode = !!process.env.CLOUD_URL;

export async function canViewTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  return getTeamUser(teamId, user.id);
}

export async function canCreateTeam({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find(a => a === PERMISSIONS.teamCreate);
  }

  if (user.isAdmin) {
    return true;
  }

  return !!user;
}

export async function canUpdateTeam({ user, grant }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  if (cloudMode) {
    return !!grant?.find(a => a === PERMISSIONS.teamUpdate);
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

export async function canAddUserToTeam({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find(a => a === PERMISSIONS.teamUpdate);
  }

  return user.isAdmin;
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
