import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { getUserWebsites } from 'queries';

export default async (req: NextApiRequestQueryBody, res: NextApiResponse) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const websites = await getUserWebsites(userId);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
