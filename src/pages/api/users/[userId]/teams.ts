import * as yup from 'yup';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUserTeams } from 'queries';

export interface UserTeamsRequestQuery extends PageParams {
  userId: string;
}

const schema = {
  GET: yup.object().shape({
    userId: yup.string().uuid().required(),
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserTeamsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { user } = req.auth;
  const { userId } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && (!userId || user.id !== userId)) {
      return unauthorized(res);
    }

    const teams = await getUserTeams(userId as string, req.query);

    return ok(res, teams);
  }

  return methodNotAllowed(res);
};
