import debug from 'debug';
import { NextApiRequestAuth } from 'interface/api/nextApi';
import { SHARE_TOKEN_HEADER, UmamiApi } from 'lib/constants';
import { secret } from 'lib/crypto';
import { parseSecureToken, parseToken } from 'next-basics';
import { getUser, getUserWebsite } from 'queries';

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
      const userWebsite = await getUserWebsite({
        userId: user.id,
        websiteId: typeId ?? id,
        isDeleted: false,
      });

      return userWebsite;
    } else if (type === UmamiApi.AuthType.User) {
      const user = await getUser({ id });

      return user && user.id === id;
    }
  }

  if (user?.isAdmin) {
    return true;
  }

  return false;
}
