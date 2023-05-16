import {
  createMiddleware,
  unauthorized,
  badRequest,
  parseSecureToken,
  tooManyRequest,
} from 'next-basics';
import debug from 'debug';
import cors from 'cors';
import { validate } from 'uuid';
import redis from '@umami/redis-client';
import { findSession } from 'lib/session';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { secret } from 'lib/crypto';
import { ROLES } from 'lib/constants';
import { getUser } from '../queries';
import { NextApiRequestCollect } from 'pages/api/send';

const log = debug('umami:middleware');

export const useCors = createMiddleware(
  cors({
    // Cache CORS preflight request 24 hours by default
    maxAge: process.env.CORS_MAX_AGE || 86400,
  }),
);

export const useSession = createMiddleware(async (req, res, next) => {
  try {
    const session = await findSession(req as NextApiRequestCollect);

    if (!session) {
      log('useSession: Session not found');
      return badRequest(res, 'Session not found.');
    }

    (req as any).session = session;
  } catch (e: any) {
    if (e.message === 'Usage Limit.') {
      return tooManyRequest(res, e.message);
    }
    return badRequest(res, e.message);
  }

  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = getAuthToken(req);
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req);

  let user = null;
  const { userId, authKey } = payload || {};

  if (validate(userId)) {
    user = await getUser({ id: userId });
  } else if (redis.enabled && authKey) {
    user = await redis.get(authKey);
  }

  if (process.env.NODE_ENV === 'development') {
    log({ token, shareToken, payload, user });
  }

  if (!user?.id && !shareToken) {
    log('useAuth: User not authorized');
    return unauthorized(res);
  }

  if (user) {
    user.isAdmin = user.role === ROLES.admin;
  }

  (req as any).auth = { user, token, shareToken, authKey };
  next();
});
