import debug from 'debug';
import cache from 'lib/cache';
import { PERMISSIONS, ROLE_PERMISSIONS, SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';
import { ensureArray, parseSecureToken, parseToken } from 'next-basics';
import { getTeamUser } from 'queries';
import { Auth } from './types';

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

export async function canViewWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    return getTeamUser(website.teamId, user.id);
  }

  return false;
}

export async function canCreateWebsite({ user }: Auth, teamId?: string) {
  if (user.isAdmin) {
    return true;
  }

  if (teamId) {
    const teamUser = await getTeamUser(teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.websiteCreate);
  }

  return hasPermission(user.role, PERMISSIONS.websiteCreate);
}

export async function canUpdateWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user.isAdmin) {
    return true;
  }

  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
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

  const teamUser = await getTeamUser(teamId, user.id);

  return hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
}

export async function canDeleteTeam({ user }: Auth, teamId: string) {
  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return hasPermission(teamUser.role, PERMISSIONS.teamDelete);
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
