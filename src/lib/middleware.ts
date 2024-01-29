import cors from 'cors';
import debug from 'debug';
import redis from '@umami/redis-client';
import { getAuthToken, parseShareToken } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { secret } from 'lib/crypto';
import { findSession } from 'lib/session';
import {
  badRequest,
  createMiddleware,
  forbidden,
  parseSecureToken,
  tooManyRequest,
  unauthorized,
} from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/send';
import { getUserById } from '../queries';
import { verifier } from './jwtVerifier';
import { JwtExpiredError,JwtInvalidIssuerError,JwtParseError } from "aws-jwt-verify/error";


const log = debug('umami:middleware');

export const useCors = createMiddleware(
  cors({
    // Cache CORS preflight request 24 hours by default
    maxAge: Number(process.env.CORS_MAX_AGE) || 86400,
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
    if (e.message.startsWith('Website not found:')) {
      return forbidden(res, e.message);
    }
    return badRequest(res, e.message);
  }

  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = getAuthToken(req);
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req as any);
  let cognitoPayload = {};
  if(!payload){
    try {
      const payload = await verifier.verify(token);
      cognitoPayload = { userId: payload['sub'], iat: payload['iat'] }
    } catch(error){
      if (error instanceof JwtExpiredError) {
        console.error("JWT expired!",error.message);
      }

      if (error instanceof JwtInvalidIssuerError) {
        console.error("JWT invalid issuer!",error.message);
      }

      if (error instanceof JwtParseError) {
        console.error("JWT Parse Issue",error.message);
      }

      console.log('INVALID TOKEN:::::',error); //unknow handle
    }
  }
  let user = null;
  const { userId, authKey, grant } = payload || cognitoPayload || {};
  if (userId) {
    user = await getUserById(userId);
  } else if (redis.enabled && authKey) {
    const key = await redis.client.get(authKey);

    if (key?.userId) {
      user = await getUserById(key.userId);
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
