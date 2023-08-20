import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, WebsiteSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userWebsites from 'pages/api/users/[id]/websites';
import * as yup from 'yup';

export interface MyWebsitesRequestQuery extends SearchFilter<WebsiteSearchFilterType> {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    ...getFilterValidation(/All|Name|Domain/i),
  }),
};

export default async (
  req: NextApiRequestQueryBody<MyWebsitesRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'GET') {
    req.query.id = req.auth.user.id;

    return userWebsites(req, res);
  }

  return methodNotAllowed(res);
};
