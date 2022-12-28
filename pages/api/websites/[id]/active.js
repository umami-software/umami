import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getActiveVisitors } from 'queries';
import { TYPE_WEBSITE } from 'lib/constants';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const { id: websiteId } = req.query;

    const result = await getActiveVisitors(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
