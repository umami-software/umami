import { getAllWebsites, getUserWebsites } from 'queries';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: current_user_id, is_admin } = req.auth;
  const { user_id, include_all } = req.query;
  const userId = +user_id;

  if (req.method === 'GET') {
    if (userId && userId !== current_user_id && !is_admin) {
      return unauthorized(res);
    }

    const websites =
      is_admin && include_all
        ? await getAllWebsites()
        : await getUserWebsites(userId || current_user_id);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
