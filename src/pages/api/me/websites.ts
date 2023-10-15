import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userWebsites from 'pages/api/users/[id]/websites';
import * as yup from 'yup';

export interface MyWebsitesRequestQuery extends SearchFilter {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<MyWebsitesRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    req.query.id = req.auth.user.id;

    return userWebsites(req, res);
  }

  return methodNotAllowed(res);
};
