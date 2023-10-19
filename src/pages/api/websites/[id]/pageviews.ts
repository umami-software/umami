import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { parseDateRangeQuery } from 'lib/query';
import { NextApiRequestQueryBody, WebsitePageviews } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getPageviewStats, getSessionStats } from 'queries';

export interface WebsitePageviewRequestQuery {
  id: string;
  startAt: number;
  endAt: number;
  unit?: string;
  timezone?: string;
  url?: string;
  referrer?: string;
  title?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region: string;
  city?: string;
}

import { TimezoneTest, UnitTypeTest } from 'lib/yup';
import * as yup from 'yup';
const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    startAt: yup.number().required(),
    endAt: yup.number().required(),
    unit: UnitTypeTest,
    timezone: TimezoneTest,
    url: yup.string(),
    referrer: yup.string(),
    title: yup.string(),
    os: yup.string(),
    browser: yup.string(),
    device: yup.string(),
    country: yup.string(),
    region: yup.string(),
    city: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsitePageviewRequestQuery>,
  res: NextApiResponse<WebsitePageviews>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    id: websiteId,
    timezone,
    url,
    referrer,
    title,
    os,
    browser,
    device,
    country,
    region,
    city,
  } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { startDate, endDate, unit } = await parseDateRangeQuery(req);

    const filters = {
      startDate,
      endDate,
      timezone,
      unit,
      url,
      referrer,
      title,
      os,
      browser,
      device,
      country,
      region,
      city,
    };

    const [pageviews, sessions] = await Promise.all([
      getPageviewStats(websiteId, filters),
      getSessionStats(websiteId, filters),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
