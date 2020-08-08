import cors from 'cors';
import { verifySession } from './session';
import { verifyAuthToken } from './auth';

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
  const session = await verifySession(req);

  if (!session) {
    return res.status(400).end();
  }

  req.session = session;
  next();
});

export const useAuth = use(async (req, res, next) => {
  const token = await verifyAuthToken(req);

  if (!token) {
    return res.status(401).end();
  }

  req.auth = token;
  next();
});
