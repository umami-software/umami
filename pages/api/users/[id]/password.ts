import { getUser, updateUser } from 'queries';
import { useAuth } from 'lib/middleware';
import {
  badRequest,
  methodNotAllowed,
  ok,
  unauthorized,
  checkPassword,
  hashPassword,
} from 'next-basics';
import { allowQuery } from 'lib/auth';
import { TYPE_USER } from 'lib/constants';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { NextApiResponse } from 'next';
import { User } from 'interface/api/models';

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

  if (!(await allowQuery(req, TYPE_USER))) {
    return unauthorized(res);
  }

  if (req.method === 'POST') {
    const user = await getUser({ id });

    if (!checkPassword(current_password, user.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(new_password);

    const updated = await updateUser({ password }, { id });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
