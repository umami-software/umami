import { getActiveVisitors } from 'lib/queries';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id } = req.query;

    const websiteId = +id;

    const result = await getActiveVisitors(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
