import { getUserWebsites } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: current_user_id, is_admin } = req.auth;
  const { user_id } = req.query;

  if (req.method === 'GET') {
    if (user_id && !is_admin) {
      return unauthorized(res);
    }

    const websites = await getUserWebsites(+user_id || current_user_id);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
