import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries';

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
    const { websiteId, startAt, endAt } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const results = await getEventDataFields(websiteId, new Date(+startAt), new Date(+endAt));

    const data = results.reduce(
      (obj, row) => {
        obj.records += Number(row.total);
        return obj;
      },
      { fields: results.length, records: 0 },
    );

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
