import { getAccountById, updateAccount } from 'queries';
import { useAuth } from 'lib/middleware';
import {
  badRequest,
  methodNotAllowed,
  ok,
  unauthorized,
  checkPassword,
  hashPassword,
} from 'next-basics';

export default async (req, res) => {
  await useAuth(req, res);

  const { userId: currentUserId, isAdmin: currentUserIsAdmin } = req.auth;
  const { current_password, new_password } = req.body;
  const { id } = req.query;
  const userId = +id;

  if (!currentUserIsAdmin && userId !== currentUserId) {
    return unauthorized(res);
  }

  if (req.method === 'POST') {
    const account = await getAccountById(userId);

    if (!checkPassword(current_password, account.password)) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(new_password);

    const updated = await updateAccount(userId, { password });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
