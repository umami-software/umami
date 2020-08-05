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
  try {
    req.session = await verifySession(req);
  } catch {
    return res.status(400).end();
  }
  next();
});

export const useAuth = use(async (req, res, next) => {
  try {
    req.auth = await verifyAuthToken(req);
  } catch {
    return res.status(401).end();
  }
  next();
});
