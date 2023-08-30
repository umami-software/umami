import redis from '@umami/redis-client';
import cors from 'cors';
import debug from 'debug';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { isUuid, secret } from 'lib/crypto';
import { findSession } from 'lib/session';
import {
  badRequest,
  createMiddleware,
  parseSecureToken,
  tooManyRequest,
  unauthorized,
} from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/send';
import { getUserById } from '../queries';
import { NextApiRequestQueryBody } from './types';

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
  const { userId, authKey, grant } = payload || {};

  if (isUuid(userId)) {
    user = await getUserById(userId);
  } else if (redis.enabled && authKey) {
    user = await redis.get(authKey);
  }

  if (process.env.NODE_ENV === 'development') {
    log({ token, shareToken, payload, user, grant });
  }

  if (!user?.id && !shareToken) {
    log('useAuth: User not authorized');
    return unauthorized(res);
  }

  if (user) {
    user.isAdmin = user.role === ROLES.admin;
  }

  (req as any).auth = {
    user,
    grant,
    token,
    shareToken,
    authKey,
  };

  next();
});

export const useValidate = createMiddleware(async (req: any, res, next) => {
  try {
    const { yup } = req as NextApiRequestQueryBody;

    yup[req.method] && yup[req.method].validateSync({ ...req.query, ...req.body });
  } catch (e: any) {
    return badRequest(res, e.message);
  }

  next();
});
