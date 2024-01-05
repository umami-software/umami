import { Report } from '@prisma/client';
import debug from 'debug';
import redis from '@umami/redis-client';
import { PERMISSIONS, ROLE_PERMISSIONS, SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';
import { createSecureToken, ensureArray, getRandomChars, parseToken } from 'next-basics';
import { findTeamWebsiteByUserId, getTeamUser, getTeamWebsite } from 'queries';
import { loadWebsite } from './load';
import { Auth } from './types';
import { NextApiRequest } from 'next';

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

  const website = await loadWebsite(websiteId);

  if (user.id === website?.userId) {
    return true;
  }

  return !!(await findTeamWebsiteByUserId(websiteId, user.id));
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

  const website = await loadWebsite(websiteId);

  return user.id === website?.userId;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await loadWebsite(websiteId);

  return user.id === website?.userId;
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

export async function canDeleteTeamWebsite({ user }: Auth, teamId: string, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const teamWebsite = await getTeamWebsite(teamId, websiteId);

  if (teamWebsite?.website?.userId === user.id) {
    return true;
  }

  if (teamWebsite) {
    const teamUser = await getTeamUser(teamWebsite.teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
  }

  return false;
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
