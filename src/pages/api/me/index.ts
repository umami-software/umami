import { NextApiResponse } from 'next';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody, User } from 'lib/types';
import { ok } from 'next-basics';

export default async (
  req: NextApiRequestQueryBody<unknown, unknown>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);

  return ok(res, req.auth.user);
};
