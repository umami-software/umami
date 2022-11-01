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
import { TYPE_ACCOUNT } from 'lib/constants';

export default async (req, res) => {
  await useAuth(req, res);

  const { current_password, new_password } = req.body;
  const { id } = req.query;

  if (!(await allowQuery(req, TYPE_ACCOUNT))) {
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
