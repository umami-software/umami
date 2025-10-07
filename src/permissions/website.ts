import { Auth } from '@/lib/types';
import { PERMISSIONS } from '@/lib/constants';
import { hasPermission } from '@/lib/auth';
import { getLink, getPixel, getTeamUser, getWebsite } from '@/queries/prisma';

export async function canViewWebsite({ user, shareToken }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.websiteId === websiteId) {
    return true;
  }

  const website = await getWebsite(websiteId);
  const link = await getLink(websiteId);
  const pixel = await getPixel(websiteId);

  const entity = website || link || pixel;

  if (!entity) {
    return false;
  }

  if (entity.userId) {
    return user.id === entity.userId;
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canViewAllWebsites({ user }: Auth) {
  return user.isAdmin;
}

export async function canCreateWebsite({ user }: Auth) {
  if (user.isAdmin) {
    return true;
  }

  return hasPermission(user.role, PERMISSIONS.websiteCreate);
}

export async function canUpdateWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}

export async function canTransferWebsiteToUser({ user }: Auth, websiteId: string, userId: string) {
  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.teamId && user.id === userId) {
    const teamUser = await getTeamUser(website.teamId, userId);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteTransferToUser);
  }

  return false;
}

export async function canTransferWebsiteToTeam({ user }: Auth, websiteId: string, teamId: string) {
  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId && website.userId === user.id) {
    const teamUser = await getTeamUser(teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteTransferToTeam);
  }

  return false;
}
