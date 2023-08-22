import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataStats } from 'queries';

export interface EventDataStatsRequestQuery {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default async (
  req: NextApiRequestQueryBody<EventDataStatsRequestQuery>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getEventDataStats(websiteId, { startDate, endDate });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
