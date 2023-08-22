import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, WebsiteSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';

import userWebsites from 'pages/api/users/[id]/websites';

export interface MyWebsitesRequestQuery extends SearchFilter<WebsiteSearchFilterType> {}

export default async (
  req: NextApiRequestQueryBody<MyWebsitesRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    req.query.id = req.auth.user.id;

    return userWebsites(req, res);
  }

  return methodNotAllowed(res);
};
