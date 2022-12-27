import { NextApiRequestQueryBody } from 'lib/types';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { ROLES } from 'lib/constants';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createUser, getUser, getUsers, User } from 'queries';

export interface UsersRequestBody {
  username: string;
  password: string;
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<any, UsersRequestBody>,
  res: NextApiResponse<User[] | User>,
) => {
  await useAuth(req, res);

  const {
    user: { isAdmin },
  } = req.auth;

  if (req.method === 'GET') {
    if (!isAdmin) {
      return unauthorized(res);
    }

    const users = await getUsers();

    return ok(res, users);
  }

  if (req.method === 'POST') {
    if (!isAdmin) {
      return unauthorized(res);
    }

    const { username, password, id } = req.body;

    const existingUser = await getUser({ username });

    if (existingUser) {
      return badRequest(res, 'User already exists');
    }

    const created = await createUser({
      id: id || uuid(),
      username,
      password: hashPassword(password),
      role: ROLES.user,
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
