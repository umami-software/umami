import moment from 'moment-timezone';
import { getEventData } from 'queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'POST') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const {
      website_id: websiteId,
      start_at,
      end_at,
      unit,
      timezone,
      event_name: eventName,
      columns,
      filters,
    } = req.body;

    if (!moment.tz.zone(timezone) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const events = await getEventData(websiteId, {
      startDate,
      endDate,
      timezone,
      unit,
      eventName,
      columns,
      filters,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
