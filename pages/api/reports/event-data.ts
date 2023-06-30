import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries/analytics/eventData/getEventDataFields';

export interface EventDataRequestBody {
  websiteId: string;
  urls: string[];
  window: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface EventDataResponse {
  urls: string[];
  window: number;
  startAt: number;
  endAt: number;
}

export default async (
  req: NextApiRequestQueryBody<any, EventDataRequestBody>,
  res: NextApiResponse<EventDataResponse>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getEventDataFields(websiteId, new Date(+startAt), new Date(+endAt));

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const {
      websiteId,
      dateRange: { startDate, endDate },
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = {};

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
