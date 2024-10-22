import { canCreateUser, canViewUsers } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, SearchFilter, User, UserSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createUser, getUserByUsername, getUsers } from 'queries';

export interface UsersRequestQuery extends SearchFilter<UserSearchFilterType> {}
export interface UsersRequestBody {
  username: string;
  password: string;
  id: string;
  role: Role;
}

import * as yup from 'yup';
const schema = {
  GET: yup.object().shape({
    ...getFilterValidation(/All|Username/i),
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

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'GET') {
    if (!(await canViewUsers(req.auth))) {
      return unauthorized(res);
    }

    const { page, filter, pageSize } = req.query;

    const users = await getUsers({ page, filter, pageSize: pageSize ? +pageSize : null });

    return ok(res, users);
  }

  if (req.method === 'POST') {
    if (!(await canCreateUser(req.auth))) {
      return unauthorized(res);
    }

    const { username, password, role, id } = req.body;

    const existingUser = await getUserByUsername(username, { showDeleted: true });

    if (existingUser) {
      return badRequest(res, 'User already exists');
    }

    const created = await createUser({
      id: id || uuid(),
      username,
      password: hashPassword(password),
      role: role ?? ROLES.user,
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
