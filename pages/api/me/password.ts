import { NextApiRequestQueryBody, User } from 'lib/types';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import {
  badRequest,
  checkPassword,
  hashPassword,
  methodNotAllowed,
  forbidden,
  ok,
} from 'next-basics';
import { getUser, updateUser } from 'queries';

export interface UserPasswordRequestQuery {
  id: string;
}

export interface UserPasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

export default async (
  req: NextApiRequestQueryBody<UserPasswordRequestQuery, UserPasswordRequestBody>,
  res: NextApiResponse<User>,
) => {
  if (process.env.CLOUD_MODE) {
    return forbidden(res);
  }

  await useAuth(req, res);

  const { currentPassword, newPassword } = req.body;
  const { id } = req.auth.user;

  if (req.method === 'POST') {
    const user = await getUser({ id }, { includePassword: true });

    if (!checkPassword(currentPassword, user.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(newPassword);

    const updated = await updateUser({ password }, { id });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
