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
import { JwtExpiredError,JwtInvalidIssuerError } from "aws-jwt-verify/error";


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
      cognitoPayload = { userId: payload['cognito:username'], iat: payload['iat'] }
    } catch(error){
      if (error instanceof JwtExpiredError) {
        console.error("JWT expired!",error.message);
      }

      if (error instanceof JwtInvalidIssuerError) {
        console.error("JWT invalid issuer!",error.message);
      }

      console.log('INVALID TOKEN:::::',error);
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

//eyJraWQiOiIxcUJBak9xbGsyeEc5Q1laM25CbXBUNWZnSjJTMXduU3dZYTIzUnhucUU0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIwNmI2MjVmOS0zYTBmLTRmNjItOGQ2Ny0zZjVjYjI1ZjkyYTQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOnJvbGVTdGF0dXMiOiJBUFBST1ZFRCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2dxYUMybFFqaCIsImNvZ25pdG86dXNlcm5hbWUiOiIwNmI2MjVmOS0zYTBmLTRmNjItOGQ2Ny0zZjVjYjI1ZjkyYTQiLCJnaXZlbl9uYW1lIjoiQW5raXQiLCJvcmlnaW5fanRpIjoiNTAyOTg5YTAtNDhjZi00MGY1LWI5MjEtZTA3ZmY4OTE3YzkyIiwiYXVkIjoiN2g2aGhvbXVpZnJsNWJlbWo4a25qbWIzbHUiLCJldmVudF9pZCI6ImVlYTAyYTk3LTVkMWItNGNlOC1hY2M3LTE3Y2IwMTQ5MGY5YiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzA0Njg5MDM1LCJuYW1lIjoiQW5raXQgU2luZ2giLCJleHAiOjE3MDQ3MDM0MzUsImN1c3RvbTpyb2xlIjoiTk9OX1BST0ZJVCIsImlhdCI6MTcwNDY4OTAzNSwiZmFtaWx5X25hbWUiOiJTaW5naCIsImp0aSI6ImFjMTc0NWY3LWYyMGEtNDZiNS1iNmJiLThkOGU5Nzg4ZGUzNiIsImVtYWlsIjoiYXN0LmFua2l0MTAxOUBnbWFpbC5jb20ifQ.VkkVpcKi1DCtSLosSigqYFSfvotfMdFtpuNQBzotEF0EspxDgwbTcLLWpmw9zNp2A7s_s2wo2u6NnUhtJDt-VWhkPU0EvTuPkKldiviPej4i41jx6xNbeW7j9954sAvAxnbdyyXOFOfBrODyLR3OPpaZhR_VbB2ay5nFrp1IiDBG8OgHHO-Ca7kVTO0DznXwqzCdp82a8Tmlk4-Nej_nkIGuQmD1nAiUAk0IO7rmWA4lY377PZW4XEEC13K0ziM-lP5B6chp2SuycxcAeDBc-Yk_QcpumH2jpLy6pPee8Ehup7IHKsA28_4W7H1CTwxoNwviHI1k-jhQLzYiusn69g