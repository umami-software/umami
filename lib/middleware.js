import { createMiddleware, unauthorized, badRequest } from 'next-basics';
import debug from 'debug';
import cors from 'cors';
import { findSession } from 'lib/session';
import { parseAuthToken, parseShareToken } from 'lib/auth';
import redis from 'lib/redis';

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
  const token = await parseAuthToken(req);
  const shareToken = await parseShareToken(req);

  const key = `auth:${token?.authKey}`;
  const data = redis.enabled ? await redis.get(key) : token;

  if (!data && !shareToken) {
    log('useAuth:user-not-authorized');
    return unauthorized(res);
  }

  req.auth = { ...data, shareToken };
  next();
});
