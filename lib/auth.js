import { parseSecureToken, parseToken, getItem } from 'next-basics';
import { AUTH_TOKEN, SHARE_TOKEN_HEADER } from './constants';
import { getWebsiteById } from 'queries';
import { secret } from './crypto';

export async function getAuthToken(req) {
  try {
    const token = req.headers.authorization;

    return parseSecureToken(token.split(' ')[1], secret());
  } catch {
    return null;
  }
}

export function getAuthHeader() {
  const token = getItem(AUTH_TOKEN);

  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function isValidToken(token, validation) {
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
  const websiteId = +id;

  const website = await getWebsiteById(websiteId);

  if (website) {
    if (token && token !== 'undefined' && !skipToken) {
      return isValidToken(token, { website_id: websiteId });
    }

    const authToken = await getAuthToken(req);

    if (authToken) {
      const { user_id, is_admin } = authToken;

      return is_admin || website.user_id === user_id;
    }
  }

  return false;
}
