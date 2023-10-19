import { useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userTeams from 'pages/api/users/[id]/teams';
import * as yup from 'yup';

export interface MyTeamsRequestQuery extends SearchFilter {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<MyTeamsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    req.query.id = req.auth.user.id;

    return userTeams(req, res);
  }

  return methodNotAllowed(res);
};
