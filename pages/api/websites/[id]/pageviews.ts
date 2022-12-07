import { NextApiRequestQueryBody, WebsitePageviews } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getPageviewStats } from 'queries';

const unitTypes = ['year', 'month', 'hour', 'day'];

export interface WebsitePageviewRequestQuery {
  id: string;
  websiteId: string;
  start_at: number;
  end_at: number;
  unit: string;
  tz: string;
  url?: string;
  referrer?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsitePageviewRequestQuery>,
  res: NextApiResponse<WebsitePageviews>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const {
    id: websiteId,
    start_at,
    end_at,
    unit,
    tz,
    url,
    referrer,
    os,
    browser,
    device,
    country,
  } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(userId, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const [pageviews, sessions] = await Promise.all([
      getPageviewStats(websiteId, {
        startDate,
        endDate,
        timezone: tz,
        unit,
        count: '*',
        filters: {
          url,
          referrer,
          os,
          browser,
          device,
          country,
        },
      }),
      getPageviewStats(websiteId, {
        startDate,
        endDate,
        timezone: tz,
        unit,
        count: 'distinct pageview.',
        filters: {
          url,
          os,
          browser,
          device,
          country,
        },
      }),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
