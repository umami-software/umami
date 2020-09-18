import { parse } from 'cookie';
import { parseSecureToken, parseToken } from './crypto';
import { AUTH_COOKIE_NAME } from './constants';
import { getWebsiteById } from './queries';

export async function getAuthToken(req) {
  const token = parse(req.headers.cookie || '')[AUTH_COOKIE_NAME];

  return parseSecureToken(token);
}

export async function isValidToken(token, validation) {
  try {
    const result = await parseToken(token);

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
  const { id, token } = req.query;
  const websiteId = +id;

  const website = await getWebsiteById(websiteId);

  if (website) {
    if (token && !skipToken) {
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
