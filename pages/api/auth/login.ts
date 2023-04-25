import debug from 'debug';
import { NextApiResponse } from 'next';
import {
  ok,
  unauthorized,
  badRequest,
  checkPassword,
  createSecureToken,
  methodNotAllowed,
} from 'next-basics';
import redis from '@umami/redis-client';
import { getUser } from 'queries';
import { secret } from 'lib/crypto';
import { NextApiRequestQueryBody, User } from 'lib/types';
import { setAuthKey } from 'lib/auth';

const log = debug('umami:auth');

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export default async (
  req: NextApiRequestQueryBody<any, LoginRequestBody>,
  res: NextApiResponse<LoginResponse>,
) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return badRequest(res);
    }

    const user = await getUser({ username }, { includePassword: true });

    if (user && checkPassword(password, user.password)) {
      if (redis.enabled) {
        const token = await setAuthKey(user);

        return ok(res, { token, user });
      }

      const token = createSecureToken({ userId: user.id }, secret());

      return ok(res, {
        token,
        user: { id: user.id, username: user.username, createdAt: user.createdAt },
      });
    }

    log('Login failed:', { username, user });

    return unauthorized(res, 'message.incorrect-username-password');
  }

  return methodNotAllowed(res);
};
