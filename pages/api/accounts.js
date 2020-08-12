import { getAccounts } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { ok, unauthorized, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin: current_user_is_admin } = req.auth;

  if (req.method === 'GET') {
    if (current_user_is_admin) {
      const accounts = await getAccounts();

      return ok(res, accounts);
    }

    return unauthorized(res);
  }

  return methodNotAllowed(res);
};
