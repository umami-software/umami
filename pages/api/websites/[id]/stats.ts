import { NextApiRequestQueryBody, WebsiteStats } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsiteStats } from 'queries';

export interface WebsiteStatsRequestQuery {
  id: string;
  type: string;
  start_at: number;
  end_at: number;
  url: string;
  referrer: string;
  os: string;
  browser: string;
  device: string;
  country: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteStatsRequestQuery>,
  res: NextApiResponse<WebsiteStats>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    id: websiteId,
    start_at,
    end_at,
    url,
    referrer,
    os,
    browser,
    device,
    country,
  } = req.query;
  const { user, shareToken } = req.auth;
  const userId = user?.id;
  const shared = shareToken?.websiteId === websiteId;

  if (req.method === 'GET') {
    const canView = await canViewWebsite(userId, websiteId);

    if (!canView && !shared) {
      return unauthorized(res);
    }

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const distance = end_at - start_at;
    const prevStartDate = new Date(+start_at - distance);
    const prevEndDate = new Date(+end_at - distance);

    const metrics = await getWebsiteStats(websiteId, {
      startDate,
      endDate,
      filters: {
        url,
        referrer,
        os,
        browser,
        device,
        country,
      },
    });
    const prevPeriod = await getWebsiteStats(websiteId, {
      startDate: prevStartDate,
      endDate: prevEndDate,
      filters: {
        url,
        referrer,
        os,
        browser,
        device,
        country,
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
