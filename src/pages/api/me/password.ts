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
import { getUser, updateUser } from 'queries';
import * as yup from 'yup';

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
  req: NextApiRequestQueryBody<any, UserPasswordRequestBody>,
  res: NextApiResponse<User>,
) => {
  if (process.env.CLOUD_MODE) {
    return forbidden(res);
  }

  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { currentPassword, newPassword } = req.body;
  const { id: userId } = req.auth.user;

  if (req.method === 'POST') {
    const user = await getUser(userId, { includePassword: true });

    if (!checkPassword(currentPassword, user.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(newPassword);

    const updated = await updateUser(userId, { password });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
