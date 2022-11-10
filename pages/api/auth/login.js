import {
  ok,
  unauthorized,
  badRequest,
  checkPassword,
  createSecureToken,
  methodNotAllowed,
  getRandomChars,
} from 'next-basics';
import { getUser } from 'queries';
import { secret } from 'lib/crypto';
import redis from 'lib/redis';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return badRequest(res);
    }

    const user = await getUser({ username });

    if (user && checkPassword(password, user.password)) {
      if (redis.enabled) {
        const key = `auth:${getRandomChars(32)}`;

        await redis.set(key, user);

        const token = createSecureToken(key, secret());

        return ok(res, { token, user });
      }

      const token = createSecureToken(user.id, secret());

      return ok(res, { token, user });
    }

    return unauthorized(res, 'Incorrect username and/or password.');
  }

  return methodNotAllowed(res);
};
