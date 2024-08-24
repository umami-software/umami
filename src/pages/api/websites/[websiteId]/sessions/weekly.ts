import * as yup from 'yup';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { pageInfo } from 'lib/schema';
import { getWebsiteSessionsWeekly } from 'queries';
import { TimezoneTest } from 'lib/yup';

export interface ReportsRequestQuery extends PageParams {
  websiteId: string;
  timezone?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().min(yup.ref('startAt')).required(),
    timezone: TimezoneTest,
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<ReportsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, startAt, endAt, timezone } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getWebsiteSessionsWeekly(websiteId, { startDate, endDate, timezone });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
