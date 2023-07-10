import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventData } from 'queries';

export interface EventDataRequestBody {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  field?: string;
}

export default async (
  req: NextApiRequestQueryBody<any, EventDataRequestBody>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt, field } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getEventData(websiteId, new Date(+startAt), new Date(+endAt), field);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
