import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { SESSION_COLUMNS, EVENT_COLUMNS, FILTER_COLUMNS, OPERATORS } from 'lib/constants';
import { getPageviewMetrics, getSessionMetrics } from 'queries';
import { getRequestFilters, getRequestDateRange } from 'lib/request';
import * as yup from 'yup';

export interface WebsiteMetricsRequestQuery {
  websiteId: string;
  type: string;
  startAt: number;
  endAt: number;
  url?: string;
  referrer?: string;
  title?: string;
  query?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  event?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    type: yup.string().required(),
    startAt: yup.number().required(),
    endAt: yup.number().required(),
    url: yup.string(),
    referrer: yup.string(),
    title: yup.string(),
    query: yup.string(),
    os: yup.string(),
    browser: yup.string(),
    device: yup.string(),
    country: yup.string(),
    region: yup.string(),
    city: yup.string(),
    language: yup.string(),
    event: yup.string(),
    limit: yup.number(),
    offset: yup.number(),
    search: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteMetricsRequestQuery>,
  res: NextApiResponse<WebsiteMetric[]>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, type, limit, offset, search } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { startDate, endDate } = await getRequestDateRange(req);
    const column = FILTER_COLUMNS[type] || type;
    const filters = {
      ...getRequestFilters(req),
      startDate,
      endDate,
    };

    if (search) {
      filters[type] = {
        name: type,
        column,
        operator: OPERATORS.contains,
        value: search,
      };
    }

    if (SESSION_COLUMNS.includes(type)) {
      const data = await getSessionMetrics(websiteId, column, filters, limit, offset);

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
      const data = await getPageviewMetrics(websiteId, column, filters, limit, offset);

      return ok(res, data);
    }

    return badRequest(res);
  }

  return methodNotAllowed(res);
};
