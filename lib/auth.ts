import { parseSecureToken, parseToken, ensureArray } from 'next-basics';
import debug from 'debug';
import cache from 'lib/cache';
import { SHARE_TOKEN_HEADER, PERMISSIONS, ROLE_PERMISSIONS } from 'lib/constants';
import { secret } from 'lib/crypto';
import { getTeamUser } from 'queries';

const log = debug('umami:auth');

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

export async function canViewWebsite(userId: string, websiteId: string) {
  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return userId === website.userId;
  }

  if (website.teamId) {
    return getTeamUser(website.teamId, userId);
  }

  return false;
}

export async function canUpdateWebsite(userId: string, websiteId: string) {
  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return userId === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, userId);

    return hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsite(userId: string, websiteId: string) {
  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return userId === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, userId);

    return hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}

// To-do: Implement when payments are setup.
export async function canCreateTeam(userId: string) {
  return !!userId;
}

// To-do: Implement when payments are setup.
export async function canViewTeam(userId: string, teamId) {
  return getTeamUser(teamId, userId);
}

export async function canUpdateTeam(userId: string, teamId: string) {
  const teamUser = await getTeamUser(teamId, userId);

  return hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
}

export async function canDeleteTeam(userId: string, teamId: string) {
  const teamUser = await getTeamUser(teamId, userId);

  return hasPermission(teamUser.role, PERMISSIONS.teamDelete);
}

export async function canViewUser(userId: string, viewedUserId: string) {
  return userId === viewedUserId;
}

export async function canUpdateUser(userId: string, viewedUserId: string) {
  return userId === viewedUserId;
}

export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some(e => ROLE_PERMISSIONS[role]?.includes(e));
}
