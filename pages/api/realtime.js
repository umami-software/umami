import { useAuth } from 'lib/middleware';
import { ok, unauthorized, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin } = req.auth;

  if (!is_admin) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const [pageviews, sessions, events] = await Promise.all([[], [], []]);

    return ok(res, { pageviews, sessions, events });
  }

  return methodNotAllowed(res);
};
