import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userTeamsRoute from 'pages/api/users/[userId]/teams';
import * as yup from 'yup';

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
};

export default async (req: NextApiRequestQueryBody, res: NextApiResponse) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    req.query.userId = req.auth.user.id;

    return userTeamsRoute(req, res);
  }

  return methodNotAllowed(res);
};
