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
    return parseToken(req.headers[SHARE_TOKEN_HEADER], secret());
  } catch {
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
    return false;
  }

  return false;
}

export async function allowQuery(req) {
  const { id } = req.query;

  const { userId, isAdmin, shareToken } = req.auth ?? {};

  if (isAdmin) {
    return true;
  }

  if (shareToken) {
    return isValidToken(shareToken, { id });
  }

  if (userId) {
    const website = await getWebsite({ id });

    return website && website.userId === userId;
  }

  return false;
}
