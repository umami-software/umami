import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { checkPermission } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
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

  if (!(await checkPermission(req, UmamiApi.Permission.Admin))) {
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
