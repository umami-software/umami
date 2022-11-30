import debug from 'debug';
import { NextApiRequestAuth } from 'interface/api/nextApi';
import cache from 'lib/cache';
import { SHARE_TOKEN_HEADER, UmamiApi } from 'lib/constants';
import { secret } from 'lib/crypto';
import { parseSecureToken, parseToken } from 'next-basics';
import { getPermissionsByUserId, getTeamUser, getUser } from 'queries';

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

export function hasPermission(
  value: UmamiApi.Role | UmamiApi.Permission,
  permissions: UmamiApi.Role[] | UmamiApi.Permission[],
) {
  return permissions.some(a => a === value);
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
  req: NextApiRequestAuth,
  type: UmamiApi.AuthType,
  typeId?: string,
) {
  const { id } = req.query as { id: string };

  const { user, shareToken } = req.auth;

  if (shareToken) {
    return isValidToken(shareToken, { id });
  }

  if (user?.id) {
    if (type === UmamiApi.AuthType.Website) {
      const website = await cache.fetchWebsite(typeId ?? id);

      if (website && website.userId === user.id) {
        return true;
      }

      if (website.teamId) {
        const teamUser = getTeamUser({ userId: user.id, teamId: website.teamId, isDeleted: false });

        return teamUser;
      }

      return false;
    } else if (type === UmamiApi.AuthType.User) {
      const user = await getUser({ id });

      return user && user.id === id;
    } else if (type === UmamiApi.AuthType.Team) {
      const teamUser = await getTeamUser({
        userId: user.id,
        teamId: typeId ?? id,
      });

      return teamUser;
    } else if (type === UmamiApi.AuthType.TeamOwner) {
      const teamUser = await getTeamUser({
        userId: user.id,
        teamId: typeId ?? id,
      });

      return (
        teamUser &&
        (teamUser.roleId === UmamiApi.Role.TeamOwner || teamUser.roleId === UmamiApi.Role.Admin)
      );
    }
  }

  return false;
}

export async function checkPermission(req: NextApiRequestAuth, type: UmamiApi.Permission) {
  const {
    user: { id: userId },
  } = req.auth;

  const userRole = await getPermissionsByUserId(userId, type);

  return userRole.length > 0;
}
