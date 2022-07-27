import { getAccountById, deleteAccount } from 'queries';
import { useAuth } from 'lib/middleware';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin } = req.auth;
  const { id } = req.query;
  const user_id = +id;

  if (!is_admin) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const account = await getAccountById(user_id);

    return ok(res, account);
  }

  if (req.method === 'DELETE') {
    await deleteAccount(user_id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
