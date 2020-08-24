import cors from 'cors';
import { verifySession } from './session';
import { verifyAuthToken } from './auth';
import { unauthorized, badRequest, serverError } from './response';

export function use(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, result => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

export const useCors = use(cors());

export const useSession = use(async (req, res, next) => {
  let session;

  try {
    session = await verifySession(req);
  } catch (e) {
    return serverError(res, e.message);
  }

  if (!session) {
    return badRequest(res);
  }

  req.session = session;
  next();
});

export const useAuth = use(async (req, res, next) => {
  let token;

  try {
    token = await verifyAuthToken(req);
  } catch (e) {
    return serverError(res, e.message);
  }

  if (!token) {
    return unauthorized(res);
  }

  req.auth = token;
  next();
});
