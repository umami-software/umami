import { getCompareDate } from '@/lib/date';
import { fetchQuery } from '@/lib/queryCache';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { getWebsiteStats } from '@/queries/sql';

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

  if (!(await canViewWebsiteSection(auth, websiteId, ['overview', 'compare']))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const result = await fetchQuery(websiteId, 'stats', query, filters.endDate, async () => {
    const { startDate, endDate } = getCompareDate(
      filters.compare ?? 'prev',
      filters.startDate,
      filters.endDate,
    );

    // The current and comparison periods are independent aggregations over the
    // event table; running them concurrently halves the endpoint's wall time.
    const [data, comparison] = await Promise.all([
      getWebsiteStats(websiteId, filters),
      getWebsiteStats(websiteId, {
        ...filters,
        startDate,
        endDate,
      }),
    ]);

    return { ...data, comparison };
  });

  return json(result);
}
