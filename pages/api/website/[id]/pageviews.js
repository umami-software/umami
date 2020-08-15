import moment from 'moment-timezone';
import { getPageviews } from 'lib/queries';
import { ok, badRequest } from 'lib/response';

const unitTypes = ['month', 'hour', 'day'];

export default async (req, res) => {
  const { id, start_at, end_at, unit, tz } = req.query;

  if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
    return badRequest(res);
  }

  const start = new Date(+start_at);
  const end = new Date(+end_at);

  const [pageviews, uniques] = await Promise.all([
    getPageviews(+id, start, end, tz, unit, '*'),
    getPageviews(+id, start, end, tz, unit, 'distinct session_id'),
  ]);

  return ok(res, { pageviews, uniques });
};
