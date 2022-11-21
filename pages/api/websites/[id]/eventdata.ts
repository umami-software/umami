import { WebsiteMetric } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { allowQuery } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
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

  if (req.method === 'POST') {
    if (!(await allowQuery(req, UmamiApi.AuthType.Website))) {
      return unauthorized(res);
    }

    const { id: websiteId } = req.query;

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
