import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, WebsiteSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsitesByUserId } from 'queries';
import * as yup from 'yup';

export interface UserWebsitesRequestQuery extends SearchFilter<WebsiteSearchFilterType> {
  id: string;
  includeTeams?: boolean;
  onlyTeams?: boolean;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    includeTeams: yup.boolean(),
    onlyTeams: yup.boolean(),
    ...getFilterValidation(/All|Name|Domain/i),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserWebsitesRequestQuery>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { user } = req.auth;
  const { id: userId, page, filter, pageSize, includeTeams, onlyTeams } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const websites = await getWebsitesByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || null,
      includeTeams,
      onlyTeams,
    });

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
