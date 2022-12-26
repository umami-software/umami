import { NextApiRequestQueryBody } from 'lib/types';
import { canUpdateUser } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import {
  badRequest,
  checkPassword,
  hashPassword,
  methodNotAllowed,
  ok,
  unauthorized,
} from 'next-basics';
import { getUser, updateUser, User } from 'queries';

export interface UserPasswordRequestQuery {
  id: string;
}

export interface UserPasswordRequestBody {
  current_password: string;
  new_password: string;
}

export default async (
  req: NextApiRequestQueryBody<UserPasswordRequestQuery, UserPasswordRequestBody>,
  res: NextApiResponse<User>,
) => {
  await useAuth(req, res);

  const { current_password, new_password } = req.body;
  const { id } = req.query;
  const {
    user: { id: userId, isAdmin },
  } = req.auth;

  if (req.method === 'POST') {
    if (!isAdmin && !(await canUpdateUser(userId, id))) {
      return unauthorized(res);
    }

    const user = await getUser({ id }, { includePassword: true });

    if (!checkPassword(current_password, user.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(new_password);

    const updated = await updateUser({ password }, { id });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
