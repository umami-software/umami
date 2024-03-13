import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUserWebsites } from 'queries';
import * as yup from 'yup';

const schema = {
  GET: yup.object().shape({
    userId: yup.string().uuid().required(),
    teamId: yup.string().uuid(),
    ...pageInfo,
  }),
};

export default async (req: NextApiRequestQueryBody, res: NextApiResponse) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { user } = req.auth;
  const { userId, page = 1, pageSize, query = '', ...rest } = req.query;

  if (req.method === 'GET') {
    if (!user.isAdmin && user.id !== userId) {
      return unauthorized(res);
    }

    const websites = await getUserWebsites(userId, {
      page,
      pageSize,
      query,
      ...rest,
    });

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
