import { validate } from 'uuid';
import { parseSecureToken, parseToken } from 'next-basics';
import { getWebsite } from 'queries';
import { SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';

export function getAuthToken(req) {
  try {
    const token = req.headers.authorization;

    return parseSecureToken(token.split(' ')[1], secret());
  } catch {
    return null;
  }
}

export function getShareToken(req) {
  try {
    return parseSecureToken(req.headers[SHARE_TOKEN_HEADER], secret());
  } catch {
    return null;
  }
}

export function isValidToken(token, validation) {
  try {
    const result = parseToken(token, secret());

    if (typeof validation === 'object') {
      return !Object.keys(validation).find(key => result[key] !== validation[key]);
    } else if (typeof validation === 'function') {
      return validation(result);
    }
  } catch (e) {
    return false;
  }

  return false;
}

export async function allowQuery(req, skipToken) {
  const { id } = req.query;
  const token = req.headers[SHARE_TOKEN_HEADER];

  const website = await getWebsite(validate(id) ? { websiteUuid: id } : { id: +id });

  if (website) {
    if (token && token !== 'undefined' && !skipToken) {
      return isValidToken(token, { websiteId: website.id });
    }

    const authToken = await getAuthToken(req);

    if (authToken) {
      const { userId, isAdmin } = authToken;

      return isAdmin || website.userId === userId;
    }
  }

  return false;
}
