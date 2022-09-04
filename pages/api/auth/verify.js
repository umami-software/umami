import { useAuth } from 'lib/middleware';
import { ok, unauthorized } from 'next-basics';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.auth) {
    return ok(res, req.auth);
  }

  return unauthorized(res);
};
