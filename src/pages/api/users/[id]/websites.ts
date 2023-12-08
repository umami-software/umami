import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsitesByUserId } from 'queries';
import * as yup from 'yup';

export interface UserWebsitesRequestQuery extends SearchFilter {
  id: string;
  includeTeams?: boolean;
  onlyTeams?: boolean;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    includeTeams: yup.boolean(),
    onlyTeams: yup.boolean(),
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserWebsitesRequestQuery>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { user } = req.auth;
  const { id: userId, page = 1, pageSize, query = '', ...rest } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const websites = await getWebsitesByUserId(userId, {
      page,
      pageSize: +pageSize || undefined,
      query,
      ...rest,
    });

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
