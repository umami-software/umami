import { WebsiteMetric } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { allowQuery } from 'lib/auth';
import { TYPE_WEBSITE } from 'lib/constants';
import { useAuth, useCors } from 'lib/middleware';
import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventMetrics } from 'queries';

const unitTypes = ['year', 'month', 'hour', 'day'];

export interface WebsiteEventsRequestQuery {
  id: string;
  start_at: string;
  end_at: string;
  unit: string;
  tz: string;
  url: string;
  event_name: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteEventsRequestQuery>,
  res: NextApiResponse<WebsiteMetric>,
) => {
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

    const events = await getEventMetrics(websiteId, {
      startDate,
      endDate,
      timezone: tz,
      unit,
      filters: {
        url,
        eventName: event_name,
      },
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
