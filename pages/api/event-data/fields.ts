import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries';

export interface EventDataFieldsRequestQuery {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  field?: string;
}

export default async (
  req: NextApiRequestQueryBody<EventDataFieldsRequestQuery>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt, field } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getEventDataFields(websiteId, { startDate, endDate, field });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
