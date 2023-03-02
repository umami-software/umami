import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { NextApiRequestQueryBody, WebsitePageviews } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getPageviewStats } from 'queries';

const unitTypes = ['year', 'month', 'hour', 'day'];

export interface WebsitePageviewRequestQuery {
  id: string;
  websiteId: string;
  startAt: number;
  endAt: number;
  unit: string;
  timezone: string;
  url?: string;
  referrer?: string;
  pageTitle?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  subdivision1?: string;
  subdivision2?: string;
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
    startAt,
    endAt,
    unit,
    timezone,
    url,
    referrer,
    pageTitle,
    os,
    browser,
    device,
    country,
    subdivision1,
    subdivision2,
    city,
  } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    if (!moment.tz.zone(timezone) || !unitTypes.includes(unit)) {
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
          pageTitle,
          os,
          browser,
          device,
          country,
          subdivision1,
          subdivision2,
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
          pageTitle,
          os,
          browser,
          device,
          country,
          subdivision1,
          subdivision2,
          city,
        },
      }),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
