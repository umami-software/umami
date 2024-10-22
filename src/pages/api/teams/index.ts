import { Team } from '@prisma/client';
import { canCreateTeam } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeam, getTeamsByUserId } from 'queries';
import * as yup from 'yup';

export interface TeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {}
export interface TeamsRequestBody {
  name: string;
}

export interface MyTeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {}

const schema = {
  GET: yup.object().shape({
    ...getFilterValidation(/All|Name|Owner/i),
  }),
  POST: yup.object().shape({
    name: yup.string().max(50).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamsRequestQuery, TeamsRequestBody>,
  res: NextApiResponse<Team[] | Team>,
) => {
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, filter, pageSize } = req.query;

    const results = await getTeamsByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || undefined,
    });

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
