import { createMiddleware, unauthorized, badRequest, serverError } from 'next-basics';
import cors from 'cors';
import { getSession } from './session';
import { getAuthToken, getShareToken } from './auth';

export const useCors = createMiddleware(
  cors({
    // Cache CORS preflight request 24 hours by default
    maxAge: process.env.CORS_MAX_AGE || 86400,
  }),
);

export const useSession = createMiddleware(async (req, res, next) => {
  let session;

  try {
    session = await getSession(req);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return serverError(res, e.message);
  }

  if (!session) {
    return badRequest(res);
  }

  req.session = session;
  next();
});

export const useAuth = createMiddleware(async (req, res, next) => {
  const token = await getAuthToken(req);
  const shareToken = await getShareToken(req);

  if (!token && !shareToken) {
    return unauthorized(res);
  }

  req.auth = { ...token, shareToken };
  next();
});
