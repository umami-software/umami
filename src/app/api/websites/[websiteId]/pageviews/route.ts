import { z } from 'zod';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { getRequestFilters, getRequestDateRange, checkRequest } from 'lib/request';
import { unit, timezone } from 'lib/schema';
import { getCompareDate } from 'lib/date';
import { badRequest, unauthorized, json } from 'lib/response';
import { getPageviewStats, getSessionStats } from 'queries';

const schema = z.object({
  startAt: z.coerce.number(),
  endAt: z.coerce.number(),
  unit,
  timezone,
  url: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
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
  const { timezone, compare } = query;

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate, unit } = await getRequestDateRange(query);

  const filters = {
    ...getRequestFilters(query),
    startDate,
    endDate,
    timezone,
    unit,
  };

  const [pageviews, sessions] = await Promise.all([
    getPageviewStats(websiteId, filters),
    getSessionStats(websiteId, filters),
  ]);

  if (compare) {
    const { startDate: compareStartDate, endDate: compareEndDate } = getCompareDate(
      compare,
      startDate,
      endDate,
    );

    const [comparePageviews, compareSessions] = await Promise.all([
      getPageviewStats(websiteId, {
        ...filters,
        startDate: compareStartDate,
        endDate: compareEndDate,
      }),
      getSessionStats(websiteId, {
        ...filters,
        startDate: compareStartDate,
        endDate: compareEndDate,
      }),
    ]);

    return json({
      pageviews,
      sessions,
      startDate,
      endDate,
      compare: {
        pageviews: comparePageviews,
        sessions: compareSessions,
        startDate: compareStartDate,
        endDate: compareEndDate,
      },
    });
  }

  return json({ pageviews, sessions });
}
