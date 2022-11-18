import { Team } from '@prisma/client';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeam, getTeam, updateTeam } from 'queries';

export interface TeamRequestQuery {
  id: string;
}

export interface TeamRequestBody {
  name?: string;
  is_deleted?: boolean;
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
    const { name, is_deleted: isDeleted } = req.body;

    if (id !== userId && !isAdmin) {
      return unauthorized(res);
    }

    const updated = await updateTeam({ name, isDeleted }, { id });

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
