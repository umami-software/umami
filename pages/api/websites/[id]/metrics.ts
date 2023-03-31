import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { FILTER_IGNORED } from 'lib/constants';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getPageviewMetrics, getSessionMetrics, getWebsite } from 'queries';

const sessionColumns = [
  'browser',
  'os',
  'device',
  'screen',
  'country',
  'language',
  'subdivision1',
  'subdivision2',
  'city',
];
const pageviewColumns = ['url', 'referrer', 'query', 'title'];

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
  switch (type) {
    case 'url':
      return 'url_path';
    case 'referrer':
      return 'referrer_domain';
    case 'event':
      return 'event_name';
    case 'query':
      return 'url_query';
    case 'title':
      return 'page_title';
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
  title: string;
  os: string;
  browser: string;
  device: string;
  country: string;
  subdivision1: string;
  subdivision2: string;
  city: string;
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
    title,
    os,
    browser,
    device,
    country,
    subdivision1,
    subdivision2,
    city,
    query,
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
          subdivision1,
          subdivision2,
          city,
        },
      });

      if (type === 'language') {
        const combined = {};

        for (const { x, y } of data) {
          const key = String(x).toLowerCase().split('-')[0];

          if (!combined[key]) {
            combined[key] = { x, y };
          } else {
            combined[key].y += y;
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
        title: type !== 'title' && table !== 'event' ? title : undefined,
        os: type !== 'os' ? os : undefined,
        browser: type !== 'browser' ? browser : undefined,
        device: type !== 'device' ? device : undefined,
        country: type !== 'country' ? country : undefined,
        subdivision1: type !== 'subdivision1' ? subdivision1 : undefined,
        subdivision2: type !== 'subdivision2' ? subdivision2 : undefined,
        city: type !== 'city' ? city : undefined,
        eventUrl: type !== 'url' && table === 'event' ? url : undefined,
        query: type !== 'query' && table !== 'event' ? query : undefined,
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
