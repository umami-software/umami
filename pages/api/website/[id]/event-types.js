import { getEventTypes } from 'lib/queries';
import { ok, methodNotAllowed, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, url } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const eventTypes = await getEventTypes(websiteId, startDate, endDate, undefined, undefined, {
      url,
    });

    return ok(res, eventTypes);
  }

  return methodNotAllowed(res);
};
