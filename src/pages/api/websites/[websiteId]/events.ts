import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { getRequestDateRange } from 'lib/request';
import { NextApiRequestQueryBody, WebsiteMetric } from 'lib/types';
import { TimezoneTest, UnitTypeTest } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventMetrics } from 'queries';
import * as yup from 'yup';

export interface WebsiteEventsRequestQuery {
  websiteId: string;
  startAt: string;
  endAt: string;
  unit?: string;
  timezone?: string;
  url: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
    unit: UnitTypeTest,
    timezone: TimezoneTest,
    url: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteEventsRequestQuery>,
  res: NextApiResponse<WebsiteMetric>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, timezone, url } = req.query;
  const { startDate, endDate, unit } = await getRequestDateRange(req);

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const events = await getEventMetrics(websiteId, {
      startDate,
      endDate,
      timezone,
      unit,
      url,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
