import { createMiddleware, unauthorized, badRequest, parseSecureToken } from 'next-basics';
import debug from 'debug';
import cors from 'cors';
import { findSession } from 'lib/session';
import { parseShareToken, getAuthToken } from 'lib/auth';
import { secret } from './crypto';
import redis from 'lib/redis';
import { getUser } from '../queries';

const log = debug('umami:middleware');

export const useCors = createMiddleware(cors());

export const useSession = createMiddleware(async (req, res, next) => {
  const session = await findSession(req);

  if (!session) {
    log('useSession:session-not-found');
    return badRequest(res);
  }

  req.session = session;
  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = getAuthToken(req);
  const key = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req);

  let user;
  if (redis.enabled) {
    user = await redis.get(key);
  } else {
    user = await getUser({ id: key });
  }

  if (!user && !shareToken) {
    log('useAuth:user-not-authorized');
    return unauthorized(res);
  }

  req.auth = { user, token, shareToken, key };
  next();
});
