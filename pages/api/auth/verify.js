import { useAuth } from 'lib/middleware';
import { ok } from 'next-basics';

export default async (req, res) => {
  await useAuth(req, res);

  return ok(res, req.auth);
};
