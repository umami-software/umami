import { z } from 'zod';
import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getPageviewStats, getSessionStats, getSessionStatsSeries } from '@/queries/sql';

const seriesMetric = z.enum(['bouncerate', 'visitduration']);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    ...filterParams,
    metric: seriesMetric.optional(),
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
  // Only the bouncerate / visitduration metrics need the per-bucket session
  // series. Skip the extra DB roundtrip for the default pageviews metric so a
  // standard website-page load stays at two queries instead of three.
  const wantsSessionSeries = query.metric === 'bouncerate' || query.metric === 'visitduration';

  const [pageviews, sessions, sessionSeries] = await Promise.all([
    getPageviewStats(websiteId, filters),
    getSessionStats(websiteId, filters),
    wantsSessionSeries ? getSessionStatsSeries(websiteId, filters) : Promise.resolve(null),
  ]);

  const bouncerate = sessionSeries
    ? sessionSeries.map(({ x, visits, bounces }) => ({
        x,
        y: Number(visits) > 0 ? (Number(bounces) / Number(visits)) * 100 : 0,
      }))
    : undefined;

  const visitduration = sessionSeries
    ? sessionSeries.map(({ x, visits, totaltime }) => ({
        x,
        y: Number(visits) > 0 ? Number(totaltime) / Number(visits) : 0,
      }))
    : undefined;

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
      wantsSessionSeries
        ? getSessionStatsSeries(websiteId, {
            ...filters,
            startDate: compareStartDate,
            endDate: compareEndDate,
          })
        : Promise.resolve(null),
    ]);

    const compareBouncerate = compareSeries
      ? compareSeries.map(({ x, visits, bounces }) => ({
          x,
          y: Number(visits) > 0 ? (Number(bounces) / Number(visits)) * 100 : 0,
        }))
      : undefined;

    const compareVisitduration = compareSeries
      ? compareSeries.map(({ x, visits, totaltime }) => ({
          x,
          y: Number(visits) > 0 ? Number(totaltime) / Number(visits) : 0,
        }))
      : undefined;

    return json({
      pageviews,
      sessions,
      ...(bouncerate && { bouncerate }),
      ...(visitduration && { visitduration }),
      startDate: filters.startDate,
      endDate: filters.endDate,
      compare: {
        pageviews: comparePageviews,
        sessions: compareSessions,
        ...(compareBouncerate && { bouncerate: compareBouncerate }),
        ...(compareVisitduration && { visitduration: compareVisitduration }),
        startDate: compareStartDate,
        endDate: compareEndDate,
      },
    });
  }

  return json({
    pageviews,
    sessions,
    ...(bouncerate && { bouncerate }),
    ...(visitduration && { visitduration }),
  });
}
