import { Team } from '@prisma/client';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok } from 'next-basics';
import { createTeam, getTeam, getTeamsByUserId } from 'queries';
export interface TeamsRequestBody {
  name: string;
  description: string;
}

export default async (
  req: NextApiRequestQueryBody<any, TeamsRequestBody>,
  res: NextApiResponse<Team[] | Team>,
) => {
  await useAuth(req, res);

  const {
    user: { id },
  } = req.auth;

  if (req.method === 'GET') {
    const teams = await getTeamsByUserId(id);

    return ok(res, teams);
  }

  if (req.method === 'POST') {
    const { name } = req.body;

    const team = await getTeam({ name });

    if (team) {
      return badRequest(res, 'Team already exists');
    }

    const created = await createTeam({
      id: id || uuid(),
      name,
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
