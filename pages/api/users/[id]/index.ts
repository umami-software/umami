import { NextApiRequestQueryBody, Role, User } from 'lib/types';
import { canDeleteUser, canUpdateUser, canViewUser } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteUser, getUser, updateUser } from 'queries';

export interface UserRequestQuery {
  id: string;
}

export interface UserRequestBody {
  username: string;
  password: string;
  role: Role;
}

export default async (
  req: NextApiRequestQueryBody<UserRequestQuery, UserRequestBody>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId, isAdmin },
  } = req.auth;
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewUser(req.auth, id))) {
      return unauthorized(res);
    }

    const user = await getUser({ id });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateUser(req.auth, id))) {
      return unauthorized(res);
    }

    const { username, password, role } = req.body;

    const user = await getUser({ id });

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
      const userByUsername = await getUser({ username });

      if (userByUsername) {
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
