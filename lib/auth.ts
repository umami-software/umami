import debug from 'debug';
import cache from 'lib/cache';
import { SHARE_TOKEN_HEADER, UmamiApi } from 'lib/constants';
import { secret } from 'lib/crypto';
import { parseSecureToken, parseToken } from 'next-basics';
import { getPermissionsByUserId, getTeamPermissionsByUserId } from 'queries';

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

export async function allowQuery(
  requestUserId: string,
  type: UmamiApi.AuthType,
  typeId?: string,
  permission?: UmamiApi.Permission,
) {
  if (type === UmamiApi.AuthType.Website) {
    const website = await cache.fetchWebsite(typeId);

    if (website && website.userId === requestUserId) {
      return true;
    }

    if (website.teamId) {
      return checkTeamPermission(requestUserId, typeId, permission);
    }

    return false;
  } else if (type === UmamiApi.AuthType.User) {
    if (requestUserId !== typeId) {
      return checkUserPermission(requestUserId, permission || UmamiApi.Permission.Admin);
    }

    return requestUserId === typeId;
  } else if (type === UmamiApi.AuthType.Team) {
    return checkTeamPermission(requestUserId, typeId, permission);
  }

  return false;
}

export async function checkUserPermission(userId: string, type: UmamiApi.Permission) {
  const userRole = await getPermissionsByUserId(userId, type);

  return userRole.length > 0;
}

export async function checkTeamPermission(userId, teamId: string, type: UmamiApi.Permission) {
  const userRole = await getTeamPermissionsByUserId(userId, teamId, type);

  return userRole.length > 0;
}
