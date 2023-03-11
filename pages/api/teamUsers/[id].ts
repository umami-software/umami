import { canDeleteTeamUser } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeamUser } from 'queries/admin/teamUser';

export interface TeamUserRequestQuery {
  id: string;
}

export default async (req: NextApiRequestQueryBody<TeamUserRequestQuery>, res: NextApiResponse) => {
  await useAuth(req, res);

  const { id: teamUserId } = req.query;

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeamUser(req.auth, teamUserId))) {
      return unauthorized(res);
    }

    const websites = await deleteTeamUser(teamUserId);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
