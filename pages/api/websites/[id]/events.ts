import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventMetrics } from 'queries';

const unitTypes = ['year', 'month', 'hour', 'day'];

export interface WebsiteEventsRequestQuery {
  id: string;
  startAt: string;
  endAt: string;
  unit: string;
  timezone: string;
  url: string;
  eventName: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteEventsRequestQuery>,
  res: NextApiResponse<WebsiteMetric>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId, startAt, endAt, unit, timezone, url, eventName } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    if (!moment.tz.zone(timezone) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }
    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const events = await getEventMetrics(websiteId, {
      startDate,
      endDate,
      timezone,
      unit,
      filters: {
        url,
        eventName,
      },
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
