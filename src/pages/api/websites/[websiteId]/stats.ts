import * as yup from 'yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, WebsiteStats } from 'lib/types';
import { getRequestFilters, getRequestDateRange } from 'lib/request';
import { getWebsiteStats } from 'queries';
import { getCompareDate } from 'lib/date';

export interface WebsiteStatsRequestQuery {
  websiteId: string;
  startAt: number;
  endAt: number;
  url?: string;
  referrer?: string;
  title?: string;
  query?: string;
  event?: string;
  host?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
  compare?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().required(),
    endAt: yup.number().required(),
    url: yup.string(),
    referrer: yup.string(),
    title: yup.string(),
    query: yup.string(),
    event: yup.string(),
    host: yup.string(),
    os: yup.string(),
    browser: yup.string(),
    device: yup.string(),
    country: yup.string(),
    region: yup.string(),
    city: yup.string(),
    compare: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteStatsRequestQuery>,
  res: NextApiResponse<WebsiteStats>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, compare } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { startDate, endDate } = await getRequestDateRange(req);
    const { startDate: compareStartDate, endDate: compareEndDate } = getCompareDate(
      compare,
      startDate,
      endDate,
    );

    const filters = getRequestFilters(req);

    const metrics = await getWebsiteStats(websiteId, { ...filters, startDate, endDate });

    const prevPeriod = await getWebsiteStats(websiteId, {
      ...filters,
      startDate: compareStartDate,
      endDate: compareEndDate,
    });

    const stats = Object.keys(metrics[0]).reduce((obj, key) => {
      obj[key] = {
        value: Number(metrics[0][key]) || 0,
        prev: Number(prevPeriod[0][key]) || 0,
      };
      return obj;
    }, {});

    return ok(res, stats);
  }

  return methodNotAllowed(res);
};
