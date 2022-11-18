import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getTeam, deleteTeam, updateTeam } from 'queries';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { Team } from '@prisma/client';

export interface TeamRequestQuery {
  id: string;
}

export interface TeamRequestBody {
  username: string;
  password: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamRequestQuery, TeamRequestBody>,
  res: NextApiResponse<Team>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId, isAdmin },
  } = req.auth;
  const { id } = req.query;

  if (req.method === 'GET') {
    if (id !== userId && !isAdmin) {
      return unauthorized(res);
    }

    const user = await getTeam({ id });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (id !== userId && !isAdmin) {
      return unauthorized(res);
    }

    const user = await getTeam({ id });

    const data: any = {};

    if (password) {
      data.password = hashPassword(password);
    }

    // Only admin can change these fields
    if (isAdmin) {
      data.username = username;
    }

    // Check when username changes
    if (data.username && user.username !== data.username) {
      const userByTeamname = await getTeam({ username });

      if (userByTeamname) {
        return badRequest(res, 'Team already exists');
      }
    }

    const updated = await updateTeam(data, { id });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (id === userId) {
      return badRequest(res, 'You cannot delete your own user.');
    }

    if (!isAdmin) {
      return unauthorized(res);
    }

    await deleteTeam(id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
