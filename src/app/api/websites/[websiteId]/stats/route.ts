import { z } from 'zod';
import { checkRequest, getRequestDateRange, getRequestFilters } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';
import { checkAuth, canViewWebsite } from 'lib/auth';
import { getCompareDate } from 'lib/date';
import { getWebsiteStats } from 'queries';

const schema = z.object({
  startAt: z.coerce.number(),
  endAt: z.coerce.number(),
  // optional
  url: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
  query: z.string().optional(),
  event: z.string().optional(),
  host: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  tag: z.string().optional(),
  compare: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);
  const { websiteId } = await params;
  const { compare } = query;

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(query);
  const { startDate: compareStartDate, endDate: compareEndDate } = getCompareDate(
    compare,
    startDate,
    endDate,
  );

  const filters = getRequestFilters(query);

  const metrics = await getWebsiteStats(websiteId, {
    ...filters,
    startDate,
    endDate,
  });

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

  return json(stats);
}
