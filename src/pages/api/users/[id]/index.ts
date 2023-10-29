import { canDeleteUser, canUpdateUser, canViewUser } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, User } from 'lib/types';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteUser, getUserById, getUserByUsername, updateUser } from 'queries';
import * as yup from 'yup';

export interface UserRequestQuery {
  id: string;
}

export interface UserRequestBody {
  username: string;
  password: string;
  role: Role;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    username: yup.string().max(255),
    password: yup.string(),
    role: yup.string().matches(/admin|user|view-only/i),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserRequestQuery, UserRequestBody>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    user: { id: userId, isAdmin },
  } = req.auth;
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewUser(req.auth, id))) {
      return unauthorized(res);
    }

    const user = await getUserById(id);

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateUser(req.auth, id))) {
      return unauthorized(res);
    }

    const { username, password, role } = req.body;

    const user = await getUserById(id);

    const data: any = {};

    if (password) {
      data.password = hashPassword(password);
    }

    // Only admin can change these fields
    if (role && isAdmin) {
      data.role = role;
    }

    if (username && isAdmin) {
      data.username = username;
    }

    // Check when username changes
    if (data.username && user.username !== data.username) {
      const user = await getUserByUsername(username);

      if (user) {
        return badRequest(res, 'User already exists');
      }
    }

    const updated = await updateUser(data, { id });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteUser(req.auth))) {
      return unauthorized(res);
    }

    if (id === userId) {
      return badRequest(res, 'You cannot delete yourself.');
    }

    await deleteUser(id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
