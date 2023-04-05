import { NextApiRequestAuth } from 'lib/types';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, ok } from 'next-basics';
import redis from '@umami/redis-client';
import { setAuthKey } from 'lib/auth';

export default async (req: NextApiRequestAuth, res: NextApiResponse) => {
  await useAuth(req, res);

  if (redis.enabled && req.auth.user) {
    const token = await setAuthKey(req.auth.user, 86400);

    return ok(res, { user: req.auth.user, token });
  }

  return badRequest(res);
};
