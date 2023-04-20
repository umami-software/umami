import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, WebsiteEventDataMetric } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventData } from 'queries';

export interface WebsiteEventDataRequestQuery {
  id: string;
}

export interface WebsiteEventDataRequestBody {
  startAt: string;
  endAt: string;
  eventName?: string;
  urlPath?: string;
  timeSeries?: {
    unit: string;
    timezone: string;
  };
  filters: [
    {
      eventKey?: string;
      eventValue?: string | number | boolean | Date;
    },
  ];
}

export default async (
  req: NextApiRequestQueryBody<WebsiteEventDataRequestQuery, WebsiteEventDataRequestBody>,
  res: NextApiResponse<WebsiteEventDataMetric[]>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId } = req.query;

  if (req.method === 'POST') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { startAt, endAt, eventName, urlPath, filters } = req.body;

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const events = await getEventData(websiteId, {
      startDate,
      endDate,
      eventName,
      urlPath,
      filters,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
