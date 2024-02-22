import { canViewUsers } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, SearchFilter, User } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUsers } from 'queries';
import * as yup from 'yup';

export interface UsersRequestQuery extends SearchFilter {}
export interface UsersRequestBody {
  username: string;
  password: string;
  id: string;
  role: Role;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    username: yup.string().max(255).required(),
    password: yup.string().required(),
    id: yup.string().uuid(),
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

    const { page, query, pageSize } = req.query;

    const users = await getUsers({ page, query, pageSize: +pageSize || undefined });

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
