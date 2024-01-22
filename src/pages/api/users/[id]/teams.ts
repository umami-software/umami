import * as yup from 'yup';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getTeamsByUserId } from 'queries';

export interface UserTeamsRequestQuery extends SearchFilter {
  id: string;
}

export interface UserTeamsRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, UserTeamsRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { user } = req.auth;
  const { id: userId } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const { page, query, pageSize } = req.query;

    const teams = await getTeamsByUserId(userId, {
      query,
      page,
      pageSize: +pageSize || undefined,
    });

    return ok(res, teams);
  }

  return methodNotAllowed(res);
};
