import cors from 'cors';
import debug from 'debug';
import { getClient, redisEnabled } from '@umami/redis-client';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { secret } from 'lib/crypto';
import { getSession } from 'lib/session';
import {
  badRequest,
  createMiddleware,
  notFound,
  parseSecureToken,
  unauthorized,
} from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/send';
import { getUser } from '../queries';

const log = debug('umami:middleware');

export const useCors = createMiddleware(
  cors({
    // Cache CORS preflight request 24 hours by default
    maxAge: Number(process.env.CORS_MAX_AGE) || 86400,
  }),
);

export const useSession = createMiddleware(async (req, res, next) => {
  try {
    const session = await getSession(req as NextApiRequestCollect);

    if (!session) {
      log('useSession: Session not found');
      return badRequest(res, 'Session not found.');
    }

    (req as any).session = session;
  } catch (e: any) {
    if (e.message.startsWith('Website not found')) {
      return notFound(res, e.message);
    }
    return badRequest(res, e.message);
  }

  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = getAuthToken(req);
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req as any);

  let user = null;
  const { userId, authKey, grant } = payload || {};

  if (userId) {
    user = await getUser(userId);
  } else if (redisEnabled && authKey) {
    const redis = getClient();

    const key = await redis.get(authKey);

    if (key?.userId) {
      user = await getUser(key.userId);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    log('useAuth:', { token, shareToken, payload, user, grant });
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

export const useValidate = async (schema, req, res) => {
  return createMiddleware(async (req: any, res, next) => {
    try {
      const rules = schema[req.method];

      if (rules) {
        rules.validateSync({ ...req.query, ...req.body });
      }
    } catch (e: any) {
      return badRequest(res, e.message);
    }

    next();
  })(req, res);
};
