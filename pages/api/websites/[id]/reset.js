import { resetWebsite } from 'queries';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { TYPE_WEBSITE } from 'lib/constants';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId } = req.query;

  if (req.method === 'POST') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    await resetWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
