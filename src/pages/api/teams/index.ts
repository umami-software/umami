import * as yup from 'yup';
import { Team } from '@prisma/client';
import { canCreateTeam } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeam } from 'queries';

export interface TeamsRequestQuery extends SearchFilter {}
export interface TeamsRequestBody {
  name: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
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
  await useValidate(schema, req, res);

  const {
    user: { id: userId },
  } = req.auth;

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
