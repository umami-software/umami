import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventData } from 'queries';

export interface WebsiteEventDataRequestQuery {
  id: string;
}

export interface WebsiteEventDataRequestBody {
  start_at: string;
  end_at: string;
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

  const {
    user: { id: userId },
  } = req.auth;
  const { id: websiteId } = req.query;

  if (req.method === 'POST') {
    const canView = canViewWebsite(userId, websiteId);

    if (!canView) {
      return unauthorized(res);
    }

    const { start_at, end_at, event_name: eventName, columns, filters } = req.body;

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const events = await getEventData(websiteId, {
      startDate,
      endDate,
      eventName,
      columns,
      filters,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
