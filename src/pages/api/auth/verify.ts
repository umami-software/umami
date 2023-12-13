import { NextApiRequestAuth } from 'lib/types';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { ok } from 'next-basics';

export default async (req: NextApiRequestAuth, res: NextApiResponse) => {
  await useAuth(req, res);

  return ok(res, req.auth.user);
};
