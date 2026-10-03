import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getBillingAccess, getTeamBillingScope } from '@/lib/load';
import type { Auth } from '@/lib/types';
import { getTeamUser } from '@/queries/prisma';

async function hasTeamBillingAccess(teamId: string) {
  return !(await getBillingAccess(await getTeamBillingScope(teamId))).isPastDue;
}

export async function canViewTeamSubscription({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return !!(await getTeamUser(teamId, user.id));
}

export async function canViewTeam(auth: Auth, teamId: string) {
  if (!(await canViewTeamSubscription(auth, teamId))) {
    return false;
  }

  return hasTeamBillingAccess(teamId);
}

export async function canCreateTeam({ user }: Auth) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return (
    !(await getBillingAccess({ accountId: user.id }, user.id)).isPastDue &&
    hasPermission(user.role, PERMISSIONS.teamCreate)
  );
}

export async function canUpdateTeam({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return (
    !!teamUser &&
    (await hasTeamBillingAccess(teamId)) &&
    hasPermission(teamUser.role, PERMISSIONS.teamUpdate)
  );
}

export async function canDeleteTeam({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return (
    !!teamUser &&
    (await hasTeamBillingAccess(teamId)) &&
    hasPermission(teamUser.role, PERMISSIONS.teamDelete)
  );
}

export async function canDeleteTeamUser({ user }: Auth, teamId: string, removeUserId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  if (removeUserId === user.id) {
    return hasTeamBillingAccess(teamId);
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return (
    !!teamUser &&
    (await hasTeamBillingAccess(teamId)) &&
    hasPermission(teamUser.role, PERMISSIONS.teamUpdate)
  );
}

export async function canCreateTeamWebsite({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return (
    !!teamUser &&
    (await hasTeamBillingAccess(teamId)) &&
    hasPermission(teamUser.role, PERMISSIONS.websiteCreate)
  );
}

export async function canViewAllTeams({ user }: Auth) {
  return user?.isAdmin ?? false;
}

export async function canEnforceTwoFactorAuthForTeam({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  return user.isAdmin;
}
