import moment from 'moment-timezone';
import { getEventMetrics } from 'queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { TYPE_WEBSITE } from 'lib/constants';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const { id: websiteId, start_at, end_at, unit, tz, url, event_name } = req.query;

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const events = await getEventMetrics(websiteId, startDate, endDate, tz, unit, {
      url,
      eventName: event_name,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
