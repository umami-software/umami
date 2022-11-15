import moment from 'moment-timezone';
import { getEventData } from 'queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { TYPE_WEBSITE } from 'lib/constants';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { NextApiResponse } from 'next';
import { WebsiteMetric } from 'interface/api/models';

export interface WebsiteEventDataRequestQuery {
  id: string;
}

export interface WebsiteEventDataRequestBody {
  start_at: string;
  end_at: string;
  timezone: string;
  event_name: string;
  columns: { [key: string]: 'count' | 'max' | 'min' | 'avg' | 'sum' };
  filters?: { [key: string]: any };
}

export default async (
  req: NextApiRequestQueryBody<WebsiteEventDataRequestQuery, WebsiteEventDataRequestBody>,
  res: NextApiResponse<WebsiteMetric>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'POST') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const { id: websiteId } = req.query;

    const { start_at, end_at, timezone, event_name: eventName, columns, filters } = req.body;

    if (!moment.tz.zone(timezone)) {
      return badRequest(res);
    }

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const events = await getEventData(websiteId, {
      startDate,
      endDate,
      timezone,
      eventName,
      columns,
      filters,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
