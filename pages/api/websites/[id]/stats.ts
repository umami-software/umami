import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, WebsiteStats } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsiteStats } from 'queries';

export interface WebsiteStatsRequestQuery {
  id: string;
  startAt: number;
  endAt: number;
  url: string;
  referrer: string;
  title: string;
  query: string;
  event: string;
  os: string;
  browser: string;
  device: string;
  country: string;
  region: string;
  city: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteStatsRequestQuery>,
  res: NextApiResponse<WebsiteStats>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    id: websiteId,
    startAt,
    endAt,
    url,
    referrer,
    title,
    query,
    event,
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

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const distance = endAt - startAt;
    const prevStartDate = new Date(+startAt - distance);
    const prevEndDate = new Date(+endAt - distance);

    const metrics = await getWebsiteStats(websiteId, {
      startDate,
      endDate,
      filters: {
        url,
        referrer,
        title,
        query,
        event,
        os,
        browser,
        device,
        country,
        region,
        city,
      },
    });
    const prevPeriod = await getWebsiteStats(websiteId, {
      startDate: prevStartDate,
      endDate: prevEndDate,
      filters: {
        url,
        referrer,
        title,
        query,
        event,
        os,
        browser,
        device,
        country,
        region,
        city,
      },
    });

    const stats = Object.keys(metrics[0]).reduce((obj, key) => {
      obj[key] = {
        value: Number(metrics[0][key]) || 0,
        change: Number(metrics[0][key]) - Number(prevPeriod[0][key]) || 0,
      };
      return obj;
    }, {});

    return ok(res, stats);
  }

  return methodNotAllowed(res);
};
