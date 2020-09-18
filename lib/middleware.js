import cors from 'cors';
import { getSession } from './session';
import { getAuthToken } from './auth';
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
    session = await getSession(req);
  } catch (e) {
    console.error(e);
    return serverError(res, e.message);
  }

  if (!session) {
    return badRequest(res);
  }

  req.session = session;
  next();
});

export const useAuth = use(async (req, res, next) => {
  const token = await getAuthToken(req);

  if (!token) {
    return unauthorized(res);
  }

  req.auth = token;
  next();
});
