import debug from 'debug';
import redis from '@umami/redis-client';
import cache from 'lib/cache';
import { PERMISSIONS, ROLE_PERMISSIONS, SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';
import {
  createSecureToken,
  ensureArray,
  getRandomChars,
  parseSecureToken,
  parseToken,
} from 'next-basics';
import { getTeamUser, getTeamUserById } from 'queries';
import { getTeamWebsite, getTeamWebsiteByTeamMemberId } from 'queries/admin/teamWebsite';
import { validate } from 'uuid';
import { Auth } from './types';
import { loadWebsite } from './query';

const log = debug('umami:auth');

export async function setAuthKey(user, expire = 0) {
  const authKey = `auth:${getRandomChars(32)}`;

  await redis.set(authKey, user);

  if (expire) {
    await redis.expire(authKey, expire);
  }

  return createSecureToken({ authKey }, secret());
}

export function getAuthToken(req) {
  try {
    return req.headers.authorization.split(' ')[1];
  } catch {
    return null;
  }
}

export function parseAuthToken(req) {
  try {
    return parseSecureToken(getAuthToken(req), secret());
  } catch (e) {
    log(e);
    return null;
  }
}

export function parseShareToken(req) {
  try {
    return parseToken(req.headers[SHARE_TOKEN_HEADER], secret());
  } catch (e) {
    log(e);
    return null;
  }
}

export function isValidToken(token, validation) {
  try {
    if (typeof validation === 'object') {
      return !Object.keys(validation).find(key => token[key] !== validation[key]);
    } else if (typeof validation === 'function') {
      return validation(token);
    }
  } catch (e) {
    log(e);
    return false;
  }

  return false;
}

export async function canViewWebsite({ user, shareToken }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.websiteId === websiteId) {
    return true;
  }

  const teamWebsite = await getTeamWebsiteByTeamMemberId(websiteId, user.id);

  if (teamWebsite) {
    return true;
  }

  const website = await loadWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  return false;
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

  if (!validate(websiteId)) {
    return false;
  }

  const website = await loadWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await loadWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  return false;
}

// To-do: Implement when payments are setup.
export async function canCreateTeam({ user }: Auth) {
  if (user.isAdmin) {
    return true;
  }

  return !!user;
}

// To-do: Implement when payments are setup.
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

  if (validate(teamId)) {
    const teamUser = await getTeamUser(teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
  }

  return false;
}

export async function canDeleteTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  if (validate(teamId)) {
    const teamUser = await getTeamUser(teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.teamDelete);
  }

  return false;
}

export async function canDeleteTeamUser({ user }: Auth, teamId: string, removeUserId: string) {
  if (user.isAdmin) {
    return true;
  }

  if (validate(teamId) && validate(removeUserId)) {
    if (removeUserId === user.id) {
      return true;
    }

    const teamUser = await getTeamUser(teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
  }

  return false;
}

export async function canDeleteTeamWebsite({ user }: Auth, teamId: string, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  if (validate(teamId) && validate(websiteId)) {
    const teamWebsite = await getTeamWebsite(teamId, websiteId);

    if (teamWebsite.website.userId === user.id) {
      return true;
    }

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
