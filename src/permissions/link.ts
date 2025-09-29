import { Auth } from '@/lib/types';
import { getLink, getTeamUser } from '@/queries/prisma';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';

export async function canViewLink({ user }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user.id === link.userId;
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canUpdateLink({ user }: Auth, linkId: string) {
  if (user.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user.id === link.userId;
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteLink({ user }: Auth, linkId: string) {
  if (user.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user.id === link.userId;
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
