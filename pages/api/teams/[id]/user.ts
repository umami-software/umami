import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createTeamUser, deleteTeamUser, getUsersByTeamId } from 'queries';

export interface TeamUserRequestQuery {
  id: string;
}

export interface TeamUserRequestBody {
  user_id: string;
  team_user_id?: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, TeamUserRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    const user = await getUsersByTeamId({ teamId });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    const { user_id: userId } = req.body;

    const updated = await createTeamUser({ id: uuid(), userId, teamId });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const { team_user_id } = req.body;

    await deleteTeamUser(team_user_id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
