import * as yup from 'yup';
import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsersByTeamId } from 'queries';

export interface TeamUserRequestQuery extends SearchFilter {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { query, page } = req.query;

    const users = await getUsersByTeamId(teamId, {
      query,
      page,
    });

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
