import { getAccount, updateAccount } from 'queries';
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
  const { id: accountUuid } = req.query;

  if (!(await allowQuery(req, TYPE_ACCOUNT))) {
    return unauthorized(res);
  }

  if (req.method === 'POST') {
    const account = await getAccount({ accountUuid });

    if (!checkPassword(current_password, account.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(new_password);

    const updated = await updateAccount({ password }, { accountUuid });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
