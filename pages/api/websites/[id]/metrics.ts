import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { FILTER_IGNORED } from 'lib/constants';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getPageviewMetrics, getSessionMetrics, getWebsite } from 'queries';

const sessionColumns = ['browser', 'os', 'device', 'screen', 'country', 'language'];
const pageviewColumns = ['url', 'referrer', 'query'];

function getTable(type) {
  if (type === 'event') {
    return 'event';
  }

  if (sessionColumns.includes(type)) {
    return 'session';
  }

  if (pageviewColumns.includes(type)) {
    return 'pageview';
  }

  throw new Error('Invalid type');
}

function getColumn(type) {
  if (type === 'event') {
    return 'event_name';
  }
  if (type === 'query') {
    return 'url';
  }
  return type;
}

export interface WebsiteMetricsRequestQuery {
  id: string;
  type: string;
  startAt: number;
  endAt: number;
  url: string;
  referrer: string;
  os: string;
  browser: string;
  device: string;
  country: string;
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
    startAt,
    endAt,
    url,
    referrer,
    os,
    browser,
    device,
    country,
  } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    if (sessionColumns.includes(type)) {
      let data = await getSessionMetrics(websiteId, {
        startDate,
        endDate,
        field: type,
        filters: {
          os,
          browser,
          device,
          country,
        },
      });

      if (type === 'language') {
        let combined = {};

        for (let { x, y } of data) {
          x = String(x).toLowerCase().split('-')[0];

          if (!combined[x]) {
            combined[x] = { x, y };
          } else {
            combined[x].y += y;
          }
        }

        data = Object.values(combined);
      }

      return ok(res, data);
    }

    if (pageviewColumns.includes(type) || type === 'event') {
      let domain;

      if (type === 'referrer') {
        const website = await getWebsite({ id: websiteId });

        if (!website) {
          return badRequest(res);
        }

        domain = website.domain;
      }

      const column = getColumn(type);
      const table = getTable(type);
      const filters = {
        domain,
        url: type !== 'url' && table !== 'event' ? url : undefined,
        referrer: type !== 'referrer' && table !== 'event' ? referrer : FILTER_IGNORED,
        os: type !== 'os' ? os : undefined,
        browser: type !== 'browser' ? browser : undefined,
        device: type !== 'device' ? device : undefined,
        country: type !== 'country' ? country : undefined,
        eventUrl: type !== 'url' && table === 'event' ? url : undefined,
        query: type === 'query' && table !== 'event' ? true : undefined,
      };

      const data = await getPageviewMetrics(websiteId, {
        startDate,
        endDate,
        column,
        filters,
        type,
      });

      return ok(res, data);
    }
  }

  return methodNotAllowed(res);
};
