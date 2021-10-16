import { getAccountById, updateAccount } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'lib/response';
import { checkPassword, hashPassword } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: auth_user_id, is_admin } = req.auth;
  const { user_id, current_password, new_password } = req.body;

  if (!is_admin && user_id !== auth_user_id) {
    return unauthorized(res);
  }

  if (req.method === 'POST') {
    const account = await getAccountById(user_id);
    const valid = checkPassword(current_password, account.password);

    if (!valid) {
      return badRequest(res, 'Current password is incorrect');
    }

    const password = hashPassword(new_password);

    const updated = await updateAccount(user_id, { password });

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
