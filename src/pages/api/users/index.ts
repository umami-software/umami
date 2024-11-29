import { canCreateUser } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, PageParams, User } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createUser, getUserByUsername } from 'queries';
import * as yup from 'yup';

export interface UsersRequestQuery extends PageParams {}
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
