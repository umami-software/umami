import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUserTeams } from 'queries';

export interface UserWebsitesRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

export default async (
  req: NextApiRequestQueryBody<any, UserWebsitesRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { user } = req.auth;
  const { id: userId } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const teams = await getUserTeams(userId);

    return ok(res, teams);
  }

  return methodNotAllowed(res);
};
