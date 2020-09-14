import moment from 'moment-timezone';
import { getPageviews } from 'lib/queries';
import { ok, badRequest, methodNotAllowed } from 'lib/response';
import { useAuth } from 'lib/middleware';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id, start_at, end_at, unit, tz } = req.query;

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const [pageviews, uniques] = await Promise.all([
      getPageviews(websiteId, startDate, endDate, tz, unit, '*'),
      getPageviews(websiteId, startDate, endDate, tz, unit, 'distinct session_id'),
    ]);

    return ok(res, { pageviews, uniques });
  }

  return methodNotAllowed(res);
};
