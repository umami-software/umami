import { useAuth } from 'lib/middleware';
import { ok, unauthorized } from 'next-basics';
import redis from 'lib/redis';
import { secret } from 'lib/crypto';
import { getAuthToken } from 'lib/auth';

export default async (req, res) => {
  if (redis.enabled) {
    const token = await getAuthToken(req, secret());
    const user = await redis.get(token);

    return ok(res, user);
  } else {
    await useAuth(req, res);

    if (req.auth) {
      return ok(res, req.auth);
    }
  }

  return unauthorized(res);
};
