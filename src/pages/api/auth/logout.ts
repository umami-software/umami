import { methodNotAllowed, ok } from 'next-basics';
import redis from '@umami/redis-client';
import { useAuth } from 'lib/middleware';
import { getAuthToken } from 'lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await useAuth(req, res);

  if (req.method === 'POST') {
    if (redis) {
      await redis.del(getAuthToken(req));
    }

    return ok(res);
  }

  return methodNotAllowed(res);
};
