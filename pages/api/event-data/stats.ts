import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries';

export interface EventDataStatsRequestQuery {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  field?: string;
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

    const results = await getEventDataFields(websiteId, { startDate, endDate });
    const fields = new Set();

    const data = results.reduce(
      (obj, row) => {
        fields.add(row.fieldName);
        obj.records += Number(row.total);
        return obj;
      },
      { events: results.length, records: 0 },
    );

    return ok(res, { ...data, fields: fields.size });
  }

  return methodNotAllowed(res);
};
