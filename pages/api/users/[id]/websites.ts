import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, WebsiteSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsitesByUserId } from 'queries';

export interface UserWebsitesRequestQuery extends SearchFilter<WebsiteSearchFilterType> {
  id: string;
}
export interface UserWebsitesRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

export default async (
  req: NextApiRequestQueryBody<any, UserWebsitesRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

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
