import { getAccounts, getAccount, updateAccount, createAccount } from 'lib/db';
import { useAuth } from 'lib/middleware';
import { hashPassword, uuid } from 'lib/crypto';
import { ok, unauthorized, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: current_user_id, is_admin } = req.auth;

  if (req.method === 'GET') {
    if (is_admin) {
      const accounts = await getAccounts();

      return ok(res, accounts);
    }

    return unauthorized(res);
  }

  if (req.method === 'POST') {
    const { user_id, username, password } = req.body;

    if (user_id) {
      const account = getAccount({ user_id });

      if (account.user_id === current_user_id || is_admin) {
        const data = { password: password ? await hashPassword(password) : undefined };

        if (is_admin) {
          data.username = username;
        }

        const updated = await updateAccount(user_id, { username, password });

        return ok(res, updated);
      }

      return unauthorized(res);
    } else {
      const account = await createAccount({ username, password: await hashPassword(password) });

      return ok(res, account);
    }
  }

  return methodNotAllowed(res);
};
