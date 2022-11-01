import { parseSecureToken, parseToken } from 'next-basics';
import { getAccount, getWebsite } from 'queries';
import debug from 'debug';
import { SHARE_TOKEN_HEADER, TYPE_ACCOUNT, TYPE_WEBSITE } from 'lib/constants';
import { secret } from 'lib/crypto';

const log = debug('umami:auth');

export function parseAuthToken(req) {
  try {
    const token = req.headers.authorization;
    return parseSecureToken(token.split(' ')[1], secret());
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

export async function allowQuery(req, type) {
  const { id } = req.query;

  const { userId, isAdmin, shareToken } = req.auth ?? {};

  if (isAdmin) {
    return true;
  }

  if (shareToken) {
    return isValidToken(shareToken, { id });
  }

  if (userId) {
    if (type === TYPE_WEBSITE) {
      const website = await getWebsite({ websiteUuid: id });

      return website && website.userId === userId;
    } else if (type === TYPE_ACCOUNT) {
      const account = await getAccount({ accountUuid: id });

      return account && account.accountUuid === id;
    }
  }

  return false;
}
