import moment from 'moment-timezone';
import { getEvents } from 'lib/queries';
import { ok, badRequest } from 'lib/response';

const unitTypes = ['month', 'hour', 'day'];

export default async (req, res) => {
  const { id, start_at, end_at, unit, tz } = req.query;

  if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
    return badRequest(res);
  }

  const websiteId = +id;
  const startDate = new Date(+start_at);
  const endDate = new Date(+end_at);

  const events = await getEvents(websiteId, startDate, endDate, tz, unit);

  return ok(res, events);
};
