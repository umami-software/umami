import { createMiddleware, unauthorized, badRequest, parseSecureToken } from 'next-basics';
import debug from 'debug';
import cors from 'cors';
import { findSession } from 'lib/session';
import { parseShareToken, getAuthToken } from 'lib/auth';
import { secret } from './crypto';

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
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req);

  if (!token && !shareToken) {
    log('useAuth:user-not-authorized');
    return unauthorized(res);
  }

  req.auth = { ...payload, shareToken };
  next();
});
