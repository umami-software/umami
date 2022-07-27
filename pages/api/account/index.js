import { getAccountById, getAccountByUsername, updateAccount, createAccount } from 'queries';
import { useAuth } from 'lib/middleware';
import { hashPassword } from 'lib/crypto';
import { ok, unauthorized, methodNotAllowed, badRequest } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: current_user_id, is_admin: current_user_is_admin } = req.auth;

  if (req.method === 'POST') {
    const { user_id, username, password, is_admin } = req.body;

    if (user_id) {
      const account = await getAccountById(user_id);

      if (account.user_id === current_user_id || current_user_is_admin) {
        const data = {};

        if (password) {
          data.password = hashPassword(password);
        }

        // Only admin can change these fields
        if (current_user_is_admin) {
          data.username = username;
          data.is_admin = is_admin;
        }

        if (data.username && account.username !== data.username) {
          const accountByUsername = await getAccountByUsername(username);

          if (accountByUsername) {
            return badRequest(res, 'Account already exists');
          }
        }

        const updated = await updateAccount(user_id, data);

        return ok(res, updated);
      }

      return unauthorized(res);
    } else {
      const accountByUsername = await getAccountByUsername(username);

      if (accountByUsername) {
        return badRequest(res, 'Account already exists');
      }

      const created = await createAccount({ username, password: hashPassword(password) });

      return ok(res, created);
    }
  }

  return methodNotAllowed(res);
};
