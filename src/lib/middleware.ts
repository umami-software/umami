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
import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito";
import { to } from '@react-spring/web';


export const authOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET ,
      issuer: process.env.COGNITO_DOMAIN ,
      idToken: true,
      name: 'Cognito',
      checks: 'nonce',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("in next auth::::",token)
      if (account) {
        if (account['provider'] === 'cognito') {
          var tokenParsed = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          console.log("token parsed",tokenParsed )
          // token.refreshToken = account?.refresh_token;
          // token.accessTokenExpires = account.expires_at * 1000;
          console.log("token parsed::::",tokenParsed['cognito:username'],tokenParsed['iat'])
          return { userId: tokenParsed['cognito:username'], iat: tokenParsed['iat'] };
        }
      }
      // Return previous token if the access token has not expired yet
      if ((Date.now()) < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      // Access token has expired, try to update it
    },
  }
}



export default NextAuth(authOptions)

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
  //console.log("got auth token",token)
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(req as any);
  //console.log("got shareToken",shareToken);
  let cognitoPayload = {};
  if(!payload){
    cognitoPayload =  await authOptions.callbacks.jwt({token:token,user:"",account:{provider:"cognito"}});
  }
  console.log("cognito auth payload",cognitoPayload)
  console.log("umami auth payload ",payload);
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