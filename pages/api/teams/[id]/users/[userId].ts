import { canDeleteTeamUser } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeamUser } from 'queries';

export interface TeamUserRequestQuery {
  id: string;
  userId: string;
}

export default async (req: NextApiRequestQueryBody<TeamUserRequestQuery>, res: NextApiResponse) => {
  await useAuth(req, res);

  if (req.method === 'DELETE') {
    const { id: teamId, userId } = req.query;

    if (!(await canDeleteTeamUser(req.auth, teamId, userId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    await deleteTeamUser(teamId, userId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
