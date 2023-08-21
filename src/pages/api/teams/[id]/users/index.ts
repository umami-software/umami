import { canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsersByTeamId } from 'queries';

export interface TeamUserRequestQuery extends SearchFilter<TeamSearchFilterType> {
  id: string;
}

export interface TeamUserRequestBody {
  email: string;
  roleId: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, TeamUserRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { page, filter, pageSize } = req.query;

    const users = await getUsersByTeamId(teamId, {
      page,
      filter,
      pageSize: +pageSize || null,
    });

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
