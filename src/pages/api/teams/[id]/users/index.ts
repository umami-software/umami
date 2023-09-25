import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsersByTeamId } from 'queries';
import * as yup from 'yup';
export interface TeamUserRequestQuery extends SearchFilter<TeamSearchFilterType> {
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
  req.yup = schema;
  await useValidate(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { page, filter, pageSize } = req.query;

    const users = await getUsersByTeamId(teamId, {
      page,
      filter,
      pageSize: +pageSize || undefined,
    });

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
