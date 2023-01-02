import redis from '@umami/redis-client';
import cors from 'cors';
import debug from 'debug';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { secret } from 'lib/crypto';
import { isOverApiLimit, findSession, findWebsite, useSessionCache } from 'lib/session';
import {
  badRequest,
  createMiddleware,
  parseSecureToken,
  tooManyRequest,
  unauthorized,
} from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/collect';
import { validate } from 'uuid';
import { getUser } from '../queries';
import { getJsonBody } from './detect';

const log = debug('umami:middleware');

export const useCors = createMiddleware(cors());

export const useSession = createMiddleware(async (req: NextApiRequestCollect, res, next) => {
  // Verify payload
  const { payload } = getJsonBody(req);

  const { website: websiteId } = payload;

  if (!payload) {
    log('useSession: No payload');
    return badRequest(res);
  }

  // Get session from cache
  let session = await useSessionCache(req);

  // Get or create session
  if (!session) {
    const website = await findWebsite(websiteId);

    if (!website) {
      log('useSession: Website not found');
      return badRequest(res);
    }

    if (process.env.ENABLE_COLLECT_LIMIT) {
      if (isOverApiLimit(website)) {
        return tooManyRequest(res, 'Collect currently exceeds monthly limit of 10000.');
      }
    }

    session = await findSession(req, payload);
  }

  if (!session) {
    log('useSession: Session not found');
    return badRequest(res);
  }

  req.session = session;
  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = getAuthToken(req);
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req);

  let user = null;
  const { userId, key } = payload || {};

  if (validate(userId)) {
    user = await getUser({ id: userId });
  } else if (redis.enabled && key) {
    user = await redis.get(key);
  }

  log({ token, payload, user, shareToken });

  if (!user && !shareToken) {
    log('useAuth: User not authorized');
    return unauthorized(res);
  }

  if (user) {
    user.isAdmin = user.role === ROLES.admin;
  }

  (req as any).auth = { user, token, shareToken, key };
  next();
});
