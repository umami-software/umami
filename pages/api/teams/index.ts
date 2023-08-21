import { Team } from '@prisma/client';
import { canCreateTeam } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeam, getTeamsByUserId } from 'queries';

export interface TeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {}
export interface TeamsRequestBody extends SearchFilter<TeamSearchFilterType> {
  name: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamsRequestQuery, TeamsRequestBody>,
  res: NextApiResponse<Team[] | Team>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, filter, pageSize } = req.query;

    const results = await getTeamsByUserId(userId, { page, filter, pageSize: +pageSize || null });

    return ok(res, results);
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
