import { createMiddleware, unauthorized, badRequest, parseSecureToken } from 'next-basics';
import debug from 'debug';
import cors from 'cors';
import { validate } from 'uuid';
import redis from '@umami/redis-client';
import { findSession } from 'lib/session';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { secret } from 'lib/crypto';
import { ROLES } from 'lib/constants';
import { getUser } from '../queries';

const log = debug('umami:middleware');

export const useCors = createMiddleware(cors());

export const useSession = createMiddleware(async (req, res, next) => {
  const session = await findSession(req);

  if (!session) {
    log('useSession: Session not found');
    return badRequest(res);
  }

  (req as any).session = session;
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
