import { NextApiRequestQueryBody } from 'lib/types';
import { canUpdateTeam, canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeamUser, deleteTeamUser, getUser, getTeamUsers } from 'queries';

export interface TeamUserRequestQuery {
  id: string;
}

export interface TeamUserRequestBody {
  email: string;
  roleId: string;
  teamUserId?: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, TeamUserRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(userId, teamId))) {
      return unauthorized(res);
    }

    const users = await getTeamUsers(teamId);

    return ok(res, users);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateTeam(userId, teamId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    const { email, roleId: roleId } = req.body;

    // Check for User
    const user = await getUser({ username: email });

    if (!user) {
      return badRequest(res, 'The User does not exists.');
    }

    const updated = await createTeamUser(user.id, teamId, roleId);

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (await canUpdateTeam(userId, teamId)) {
      return unauthorized(res, 'You must be the owner of this team.');
    }
    const { teamUserId } = req.body;

    await deleteTeamUser(teamUserId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
