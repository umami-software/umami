import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getTeamsByUserId } from 'queries';

export interface UserTeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {
  id: string;
}

export interface UserTeamsRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

export default async (
  req: NextApiRequestQueryBody<any, UserTeamsRequestBody>,
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

    const { page, filter, pageSize } = req.query;

    const teams = await getTeamsByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || null,
    });

    return ok(res, teams);
  }

  return methodNotAllowed(res);
};
