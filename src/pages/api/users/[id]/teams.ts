import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getTeamsByUserId } from 'queries';
import * as yup from 'yup';
export interface UserTeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {
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
    ...getFilterValidation('/All|Name|Owner/i'),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, UserTeamsRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { user } = req.auth;
  const { id: userId } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const { page, filter, pageSize } = req.query;

    const teams = await getTeamsByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || undefined,
    });

    return ok(res, teams);
  }

  return methodNotAllowed(res);
};
