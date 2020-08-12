import { getUserWebsites } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id } = req.auth;

  if (req.method === 'GET') {
    const websites = await getUserWebsites(user_id);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
