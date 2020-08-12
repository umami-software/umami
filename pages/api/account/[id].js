import { getAccountById, deleteAccount } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin } = req.auth;
  const { id } = req.query;
  const user_id = +id;

  if (req.method === 'GET') {
    if (is_admin) {
      const account = await getAccountById(user_id);

      return ok(res, account);
    }

    return unauthorized(res);
  }

  if (req.method === 'DELETE') {
    if (is_admin) {
      await deleteAccount(user_id);

      return ok(res);
    }

    return unauthorized(res);
  }

  return methodNotAllowed(res);
};
