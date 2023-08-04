import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { SESSION_COLUMNS, EVENT_COLUMNS, FILTER_COLUMNS } from 'lib/constants';
import { getPageviewMetrics, getSessionMetrics } from 'queries';
import { parseDateRangeQuery } from 'lib/query';

export interface WebsiteMetricsRequestQuery {
  id: string;
  type: string;
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
  language: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteMetricsRequestQuery>,
  res: NextApiResponse<WebsiteMetric[]>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    id: websiteId,
    type,
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
    language,
  } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { startDate, endDate } = await parseDateRangeQuery(req);

    const filters = {
      startDate,
      endDate,
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
      language,
    };

    filters[type] = undefined;

    const column = FILTER_COLUMNS[type] || type;

    if (SESSION_COLUMNS.includes(type)) {
      const data = await getSessionMetrics(websiteId, column, filters);

      if (type === 'language') {
        const combined = {};

        for (const { x, y } of data) {
          const key = String(x).toLowerCase().split('-')[0];

          if (combined[key] === undefined) {
            combined[key] = { x: key, y };
          } else {
            combined[key].y += y;
          }
        }

        return ok(res, Object.values(combined));
      }

      return ok(res, data);
    }

    if (EVENT_COLUMNS.includes(type)) {
      const data = await getPageviewMetrics(websiteId, column, filters);

      return ok(res, data);
    }

    return badRequest(res);
  }

  return methodNotAllowed(res);
};
