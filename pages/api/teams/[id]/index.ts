import { Team } from '@prisma/client';
import { NextApiRequestQueryBody } from 'lib/types';
import { canDeleteTeam, canUpdateTeam, canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeam, getTeam, updateTeam } from 'queries';

export interface TeamRequestQuery {
  id: string;
}

export interface TeamRequestBody {
  name: string;
  accessCode: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamRequestQuery, TeamRequestBody>,
  res: NextApiResponse<Team>,
) => {
  await useAuth(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const user = await getTeam({ id: teamId });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateTeam(req.auth, teamId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    const { name, accessCode } = req.body;
    const data = { name, accessCode };

    const updated = await updateTeam(data, { id: teamId });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeam(req.auth, teamId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    await deleteTeam(teamId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
