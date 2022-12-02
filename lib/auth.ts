import { parseSecureToken, parseToken } from 'next-basics';
import { UserRole } from '@prisma/client';
import debug from 'debug';
import cache from 'lib/cache';
import { SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';
import { Permission, Roles } from 'lib/types';
import { getTeamUser, getUserRoles } from 'queries';

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
    const teamUser = await getTeamUser({ userId, teamId: website.teamId });

    checkPermission(Permission.websiteUpdate, teamUser.role);
  }

  return checkAdmin(userId);
}

export async function canUpdateWebsite(userId: string, websiteId: string) {
  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return userId === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser({ userId, teamId: website.teamId });

    checkPermission(Permission.websiteUpdate, teamUser.role);
  }

  return checkAdmin(userId);
}

export async function canDeleteWebsite(userId: string, websiteId: string) {
  const website = await cache.fetchWebsite(websiteId);

  if (website.userId) {
    return userId === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser({ userId, teamId: website.teamId });

    if (checkPermission(Permission.websiteDelete, teamUser.role)) {
      return true;
    }
  }

  return checkAdmin(userId);
}

// To-do: Implement when payments are setup.
export async function canCreateTeam(userId: string) {
  return !!userId;
}

// To-do: Implement when payments are setup.
export async function canViewTeam(userId: string, teamId) {
  const teamUser = await getTeamUser({ userId, teamId });
  return !!teamUser;
}

export async function canUpdateTeam(userId: string, teamId: string) {
  const teamUser = await getTeamUser({ userId, teamId });

  if (checkPermission(Permission.teamUpdate, teamUser.role)) {
    return true;
  }
}

export async function canDeleteTeam(userId: string, teamId: string) {
  const teamUser = await getTeamUser({ userId, teamId });

  if (checkPermission(Permission.teamDelete, teamUser.role)) {
    return true;
  }
}

export async function canCreateUser(userId: string) {
  return checkAdmin(userId);
}

export async function canViewUser(userId: string, viewedUserId: string) {
  if (userId === viewedUserId) {
    return true;
  }

  return checkAdmin(userId);
}

export async function canViewUsers(userId: string) {
  return checkAdmin(userId);
}

export async function canUpdateUser(userId: string, viewedUserId: string) {
  if (userId === viewedUserId) {
    return true;
  }

  return checkAdmin(userId);
}

export async function canUpdateUserRole(userId: string) {
  return checkAdmin(userId);
}

export async function canDeleteUser(userId: string) {
  return checkAdmin(userId);
}

export async function checkPermission(permission: Permission, role: string) {
  return Roles[role].permissions.some(a => a === permission);
}

export async function checkAdmin(userId: string, userRoles?: UserRole[]) {
  if (!userRoles) {
    userRoles = await getUserRoles({ userId });
  }

  return userRoles.some(a => a.role === Roles.admin.name);
}
