import { methodNotAllowed, ok } from 'next-basics';
import { useAuth } from 'lib/middleware';
import redis from 'lib/redis';
import { getAuthToken } from 'lib/auth';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'POST') {
    if (redis.enabled) {
      await redis.del(`auth:${getAuthToken(req)}`);
    }

    return ok(res);
  }

  return methodNotAllowed(res);
};
