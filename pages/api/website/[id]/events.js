import moment from 'moment-timezone';
import { getEventMetrics } from 'lib/queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, unit, tz, url } = req.query;

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const events = await getEventMetrics(websiteId, startDate, endDate, tz, unit, { url });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
