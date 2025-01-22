import * as yup from 'yup';
import { canDeleteUser, canUpdateUser, canViewUser } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, User } from 'lib/types';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteUser, getUser, getUserByUsername, updateUser } from 'queries';

export interface UserRequestQuery {
  userId: string;
}

export interface UserRequestBody {
  userId: string;
  username: string;
  password: string;
  role: Role;
}

const schema = {
  GET: yup.object().shape({
    userId: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    userId: yup.string().uuid().required(),
    username: yup.string().max(255),
    password: yup.string(),
    role: yup.string().matches(/admin|user|view-only/i),
  }),
  DELETE: yup.object().shape({
    userId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserRequestQuery, UserRequestBody>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    user: { isAdmin },
  } = req.auth;
  const userId: string = req.query.userId;

  if (req.method === 'GET') {
    if (!(await canViewUser(req.auth, userId))) {
      return unauthorized(res);
    }

    const user = await getUser(userId);

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateUser(req.auth, userId))) {
      return unauthorized(res);
    }

    const { username, password, role } = req.body;

    const user = await getUser(userId);

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

    const updated = await updateUser(userId, data);

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteUser(req.auth))) {
      return unauthorized(res);
    }

    if (userId === req.auth.user.id) {
      return badRequest(res, 'You cannot delete yourself.');
    }

    await deleteUser(userId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
