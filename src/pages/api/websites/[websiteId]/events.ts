import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { getRequestDateRange, getRequestFilters } from 'lib/request';
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
  referrer?: string;
  title?: string;
  host?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region: string;
  city?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().min(yup.ref('startAt')).required(),
    unit: UnitTypeTest,
    timezone: TimezoneTest,
    url: yup.string(),
    referrer: yup.string(),
    title: yup.string(),
    host: yup.string(),
    os: yup.string(),
    browser: yup.string(),
    device: yup.string(),
    country: yup.string(),
    region: yup.string(),
    city: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteEventsRequestQuery>,
  res: NextApiResponse<WebsiteMetric>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, timezone } = req.query;
  const { startDate, endDate, unit } = await getRequestDateRange(req);

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const filters = {
      ...getRequestFilters(req),
      startDate,
      endDate,
      timezone,
      unit,
    };

    const events = await getEventMetrics(websiteId, filters);

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
