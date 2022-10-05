import { ok, unauthorized, methodNotAllowed, badRequest, hashPassword } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';
import { createAccount, getAccountByUsername, getAccounts } from 'queries';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin } = req.auth;

  if (!is_admin) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const accounts = await getAccounts();

    return ok(res, accounts);
  }

  if (req.method === 'POST') {
    const { username, password, account_uuid } = req.body;

    const accountByUsername = await getAccountByUsername(username);

    if (accountByUsername) {
      return badRequest(res, 'Account already exists');
    }

    const created = await createAccount({
      username,
      password: hashPassword(password),
      account_uuid: account_uuid || uuid(),
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
