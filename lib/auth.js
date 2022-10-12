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

export async function allowQuery(req) {
  const { id: websiteId } = req.query;

  const { userId, isAdmin, shareToken } = req.auth ?? {};

  if (isAdmin) {
    return true;
  }

  if (shareToken) {
    return isValidToken(shareToken, { websiteUuid: websiteId });
  }

  if (userId) {
    const website = await getWebsite({ websiteUuid: websiteId });

    return website && website.userId === userId;
  }

  return false;
}
