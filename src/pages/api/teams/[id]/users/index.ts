import * as yup from 'yup';
import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsersByTeamId } from 'queries';
import { pageInfo } from 'lib/schema';

export interface TeamUserRequestQuery extends SearchFilter {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    ...pageInfo,
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

    const { query, page, pageSize } = req.query;

    const users = await getUsersByTeamId(teamId, {
      query,
      page,
      pageSize: +pageSize || undefined,
    });

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
