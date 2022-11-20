import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { checkPermission } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteUser, getUser, updateUser, User } from 'queries';

export interface UserRequestQuery {
  id: string;
}

export interface UserRequestBody {
  username: string;
  password: string;
}

export default async (
  req: NextApiRequestQueryBody<UserRequestQuery, UserRequestBody>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const { id } = req.query;

  if (req.method === 'GET') {
    if (id !== userId) {
      return unauthorized(res);
    }

    const user = await getUser({ id });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (id !== userId) {
      return unauthorized(res);
    }

    const user = await getUser({ id });

    const data: any = {};

    if (password) {
      data.password = hashPassword(password);
    }

    // Only admin can change these fields
    if (!(await checkPermission(req, UmamiApi.Permission.Admin))) {
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
    if (id === userId) {
      return badRequest(res, 'You cannot delete your own user.');
    }

    if (!(await checkPermission(req, UmamiApi.Permission.Admin))) {
      return unauthorized(res);
    }

    await deleteUser(id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
