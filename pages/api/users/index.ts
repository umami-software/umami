import { ok, unauthorized, methodNotAllowed, badRequest, hashPassword } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';
import { createUser, getUser, getUsers } from 'queries';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { NextApiResponse } from 'next';
import { User } from 'interface/api/models';

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

  if (!isAdmin) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const users = await getUsers();

    return ok(res, users);
  }

  if (req.method === 'POST') {
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
