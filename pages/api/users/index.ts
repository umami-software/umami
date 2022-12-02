import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { canCreateUser, canViewUsers } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
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
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    if (canViewUsers(userId)) {
      return unauthorized(res);
    }

    const users = await getUsers();

    return ok(res, users);
  }

  if (req.method === 'POST') {
    if (canCreateUser(userId)) {
      return unauthorized(res);
    }

    const { username, password, id } = req.body;

    const user = await getUser({ username });

    if (user) {
      return badRequest(res, 'User already exists');
    }

    const created = await createUser({
      id: id || uuid(),
      username,
      password: hashPassword(password),
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
