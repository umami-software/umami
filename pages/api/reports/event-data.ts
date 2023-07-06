import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries/analytics/eventData/getEventDataFields';
import { getEventData } from 'queries';

export interface EventDataRequestBody {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  fields: [
    {
      name: string;
      type: string;
      value: string;
    },
  ];
  filters: [
    {
      name: string;
      type: string;
      value: string;
    },
  ];
  groups: [
    {
      name: string;
      type: string;
    },
  ];
}

export default async (
  req: NextApiRequestQueryBody<any, EventDataRequestBody>,
  res: NextApiResponse<any>,
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
      ...criteria
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getEventData(
      websiteId,
      new Date(startDate),
      new Date(endDate),
      criteria as any,
    );

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
