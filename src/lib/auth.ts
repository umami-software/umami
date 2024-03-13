import { Report } from '@prisma/client';
import redis from '@umami/redis-client';
import debug from 'debug';
import { PERMISSIONS, ROLE_PERMISSIONS, SHARE_TOKEN_HEADER, ROLES } from 'lib/constants';
import { secret } from 'lib/crypto';
import { NextApiRequest } from 'next';
import { createSecureToken, ensureArray, getRandomChars, parseToken } from 'next-basics';
import { getTeamUser, getWebsite } from 'queries';
import { Auth } from './types';

const log = debug('umami:auth');
const cloudMode = process.env.CLOUD_MODE;

export async function saveAuth(data: any, expire = 0) {
  const authKey = `auth:${getRandomChars(32)}`;

  await redis.client.set(authKey, data);

  if (expire) {
    await redis.client.expire(authKey, expire);
  }

  return createSecureToken({ authKey }, secret());
}

export function getAuthToken(req: NextApiRequest) {
  try {
    return req.headers.authorization.split(' ')[1];
  } catch {
    return null;
  }
}

export function parseShareToken(req: Request) {
  try {
    return parseToken(req.headers[SHARE_TOKEN_HEADER], secret());
  } catch (e) {
    log(e);
    return null;
  }
}

export async function canViewWebsite({ user, shareToken }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.websiteId === websiteId) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canViewAllWebsites({ user }: Auth) {
  return user.isAdmin;
}

export async function canCreateWebsite({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find(a => a === PERMISSIONS.websiteCreate);
  }

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

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canTransferWebsiteToUser({ user }: Auth, websiteId: string, userId: string) {
  const website = await getWebsite(websiteId);

  if (website.teamId && user.id === userId) {
    const teamUser = await getTeamUser(website.teamId, userId);

    return teamUser?.role === ROLES.teamOwner;
  }

  return false;
}

export async function canTransferWebsiteToTeam({ user }: Auth, websiteId: string, teamId: string) {
  const website = await getWebsite(websiteId);

  if (website.userId && website.userId === user.id) {
    const teamUser = await getTeamUser(teamId, user.id);

    return teamUser?.role === ROLES.teamOwner;
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}

export async function canViewReport(auth: Auth, report: Report) {
  if (auth.user.isAdmin) {
    return true;
  }

  if (auth.user.id == report.userId) {
    return true;
  }

  return !!(await canViewWebsite(auth, report.websiteId));
}

export async function canUpdateReport({ user }: Auth, report: Report) {
  if (user.isAdmin) {
    return true;
  }

  return user.id == report.userId;
}

export async function canDeleteReport(auth: Auth, report: Report) {
  return canUpdateReport(auth, report);
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

export async function canViewTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  return getTeamUser(teamId, user.id);
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

export async function canAddUserToTeam({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find(a => a === PERMISSIONS.teamUpdate);
  }

  return user.isAdmin;
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

export async function canCreateUser({ user }: Auth) {
  return user.isAdmin;
}

export async function canViewUser({ user }: Auth, viewedUserId: string) {
  if (user.isAdmin) {
    return true;
  }

  return user.id === viewedUserId;
}

export async function canViewUsers({ user }: Auth) {
  return user.isAdmin;
}

export async function canUpdateUser({ user }: Auth, viewedUserId: string) {
  if (user.isAdmin) {
    return true;
  }

  return user.id === viewedUserId;
}

export async function canDeleteUser({ user }: Auth) {
  return user.isAdmin;
}

export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some(e => ROLE_PERMISSIONS[role]?.includes(e));
}
