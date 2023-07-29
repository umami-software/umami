import { Team } from '@prisma/client';
import { NextApiRequestQueryBody } from 'lib/types';
import { canCreateTeam } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeam, getUserTeams } from 'queries';

export interface TeamsRequestBody {
  name: string;
}

export default async (
  req: NextApiRequestQueryBody<any, TeamsRequestBody>,
  res: NextApiResponse<Team[] | Team>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const teams = await getUserTeams(userId);

    return ok(res, teams);
  }

  if (req.method === 'POST') {
    if (!(await canCreateTeam(req.auth))) {
      return unauthorized(res);
    }

    const { name } = req.body;

    const team = await createTeam(
      {
        id: uuid(),
        name,
        accessCode: getRandomChars(16),
      },
      userId,
    );

    return ok(res, team);
  }

  return methodNotAllowed(res);
};
