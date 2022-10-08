import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useCors } from 'lib/middleware';
import { getActiveVisitors } from 'queries';

export default async (req, res) => {
  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id } = req.query;

    const websiteId = +id;
    const website_uuid = id;

    const result = await getActiveVisitors(websiteId, website_uuid);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
