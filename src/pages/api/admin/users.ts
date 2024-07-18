import { canViewUsers } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, PageParams, User } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsers } from 'queries';
import * as yup from 'yup';

export interface UsersRequestQuery extends PageParams {}
export interface UsersRequestBody {
  userId: string;
  username: string;
  password: string;
  role: Role;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    userId: yup.string().uuid(),
    username: yup.string().max(255).required(),
    password: yup.string().required(),
    role: yup
      .string()
      .matches(/admin|user|view-only/i)
      .required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UsersRequestQuery, UsersRequestBody>,
  res: NextApiResponse<User[] | User>,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    if (!(await canViewUsers(req.auth))) {
      return unauthorized(res);
    }

    const users = await getUsers(
      {
        include: {
          _count: {
            select: {
              websiteUser: {
                where: { deletedAt: null },
              },
            },
          },
        },
      },
      req.query,
    );

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
