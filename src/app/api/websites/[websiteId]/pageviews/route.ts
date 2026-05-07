import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getPageviewStats, getSessionStats, getSessionStatsSeries } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const [pageviews, sessions, sessionSeries] = await Promise.all([
    getPageviewStats(websiteId, filters),
    getSessionStats(websiteId, filters),
    getSessionStatsSeries(websiteId, filters),
  ]);

  const bouncerate = sessionSeries.map(({ x, visits, bounces }) => ({
    x,
    y: Number(visits) > 0 ? (Number(bounces) / Number(visits)) * 100 : 0,
  }));

  const visitduration = sessionSeries.map(({ x, visits, totaltime }) => ({
    x,
    y: Number(visits) > 0 ? Number(totaltime) / Number(visits) : 0,
  }));

  if (filters.compare) {
    const { startDate: compareStartDate, endDate: compareEndDate } = getCompareDate(
      filters.compare,
      filters.startDate,
      filters.endDate,
    );

    const [comparePageviews, compareSessions, compareSeries] = await Promise.all([
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
      getSessionStatsSeries(websiteId, {
        ...filters,
        startDate: compareStartDate,
        endDate: compareEndDate,
      }),
    ]);

    const compareBouncerate = compareSeries.map(({ x, visits, bounces }) => ({
      x,
      y: Number(visits) > 0 ? (Number(bounces) / Number(visits)) * 100 : 0,
    }));
    const compareVisitduration = compareSeries.map(({ x, visits, totaltime }) => ({
      x,
      y: Number(visits) > 0 ? Number(totaltime) / Number(visits) : 0,
    }));

    return json({
      pageviews,
      sessions,
      bouncerate,
      visitduration,
      startDate: filters.startDate,
      endDate: filters.endDate,
      compare: {
        pageviews: comparePageviews,
        sessions: compareSessions,
        bouncerate: compareBouncerate,
        visitduration: compareVisitduration,
        startDate: compareStartDate,
        endDate: compareEndDate,
      },
    });
  }

  return json({ pageviews, sessions, bouncerate, visitduration });
}
