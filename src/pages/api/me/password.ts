import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, User } from 'lib/types';
import { NextApiResponse } from 'next';
import {
  badRequest,
  checkPassword,
  forbidden,
  hashPassword,
  methodNotAllowed,
  ok,
} from 'next-basics';
import { getUserById, updateUser } from 'queries';
import * as yup from 'yup';

export interface UserPasswordRequestQuery {
  id: string;
}

export interface UserPasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

const schema = {
  POST: yup.object().shape({
    currentPassword: yup.string().required(),
    newPassword: yup.string().min(8).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserPasswordRequestQuery, UserPasswordRequestBody>,
  res: NextApiResponse<User>,
) => {
  if (process.env.CLOUD_MODE) {
    return forbidden(res);
  }

  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { currentPassword, newPassword } = req.body;
  const { id } = req.auth.user;

  if (req.method === 'POST') {
    const user = await getUserById(id, { includePassword: true });

    if (!checkPassword(currentPassword, user.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(newPassword);

    const updated = await updateUser({ password }, { id });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
