import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { NextApiRequestQueryBody, WebsitePageviews } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getPageviewStats } from 'queries';
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

export default async (
  req: NextApiRequestQueryBody<WebsitePageviewRequestQuery>,
  res: NextApiResponse<WebsitePageviews>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

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

    const [pageviews, sessions] = await Promise.all([
      getPageviewStats(websiteId, {
        startDate,
        endDate,
        timezone,
        unit,
        count: '*',
        filters: {
          url,
          referrer,
          title,
          os,
          browser,
          device,
          country,
          region,
          city,
        },
      }),
      getPageviewStats(websiteId, {
        startDate,
        endDate,
        timezone,
        unit,
        count: 'distinct website_event.',
        filters: {
          url,
          title,
          os,
          browser,
          device,
          country,
          region,
          city,
        },
      }),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
