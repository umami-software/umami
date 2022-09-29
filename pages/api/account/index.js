import { ok, unauthorized, methodNotAllowed, badRequest, hashPassword } from 'next-basics';
import { getAccountByUsername, createAccount } from 'queries';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  if (req.method === 'POST') {
    await useAuth(req, res);

    if (!req.auth.is_admin) {
      return unauthorized(res);
    }

    const { username, password } = req.body;

    const accountByUsername = await getAccountByUsername(username);

    if (accountByUsername) {
      return badRequest(res, 'Account already exists');
    }

    const created = await createAccount({ username, password: hashPassword(password) });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};
