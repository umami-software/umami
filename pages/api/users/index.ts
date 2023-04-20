import { canCreateUser, canViewUsers } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody, Roles, User } from 'lib/types';
import { NextApiResponse } from 'next';
import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createUser, getUser, getUsers } from 'queries';

export interface UsersRequestBody {
  username: string;
  password: string;
  id: string;
  role?: Roles;
}

export default async (
  req: NextApiRequestQueryBody<any, UsersRequestBody>,
  res: NextApiResponse<User[] | User>,
) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await canViewUsers(req.auth))) {
      return unauthorized(res);
    }

    const users = await getUsers();

    return ok(res, users);
  }

  if (req.method === 'POST') {
    if (!(await canCreateUser(req.auth))) {
      return unauthorized(res);
    }

    const { username, password, role, id } = req.body;

    const existingUser = await getUser({ username }, { showDeleted: true });

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
