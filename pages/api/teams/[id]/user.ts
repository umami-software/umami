import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { allowQuery } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeamUser, deleteTeamUser, getUser, getUsersByTeamId } from 'queries';

export interface TeamUserRequestQuery {
  id: string;
}

export interface TeamUserRequestBody {
  email: string;
  role_id: string;
  team_user_id?: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, TeamUserRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await allowQuery(req, UmamiApi.AuthType.Team))) {
      return unauthorized(res);
    }

    const user = await getUsersByTeamId({ teamId });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await allowQuery(req, UmamiApi.AuthType.TeamOwner))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    const { email, role_id: roleId } = req.body;

    // Check for User
    const user = await getUser({ username: email });

    if (!user) {
      return badRequest(res, 'The User does not exists.');
    }

    const updated = await createTeamUser(user.id, teamId, roleId);

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!(await allowQuery(req, UmamiApi.AuthType.TeamOwner))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }
    const { team_user_id } = req.body;

    await deleteTeamUser(team_user_id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
