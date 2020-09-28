import moment from 'moment-timezone';
import { getPageviews } from 'lib/queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, unit, tz, url } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const [pageviews, uniques] = await Promise.all([
      getPageviews(websiteId, startDate, endDate, tz, unit, '*', url),
      getPageviews(websiteId, startDate, endDate, tz, unit, 'distinct session_id', url),
    ]);

    return ok(res, { pageviews, uniques });
  }

  return methodNotAllowed(res);
};
