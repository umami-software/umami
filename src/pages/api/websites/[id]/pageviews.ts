import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { NextApiRequestQueryBody, WebsitePageviews } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { getPageviewStats, getSessionStats } from 'queries';
import { parseDateRangeQuery } from 'lib/query';

export interface WebsitePageviewRequestQuery {
  id: string;
  startAt: number;
  endAt: number;
  unit: string;
  timezone: string;
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

import * as yup from 'yup';
const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsitePageviewRequestQuery>,
  res: NextApiResponse<WebsitePageviews>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

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

    if (!moment.tz.zone(timezone)) {
      return badRequest(res);
    }

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
