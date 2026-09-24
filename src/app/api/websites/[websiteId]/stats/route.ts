import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getWebsiteStats } from '@/queries/sql';
import { analyticsQuerySchema } from '../analytics-schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, analyticsQuerySchema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, ['overview', 'compare']))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const data = await getWebsiteStats(websiteId, filters);

  const { startDate, endDate } = getCompareDate(
    filters.compare ?? 'prev',
    filters.startDate,
    filters.endDate,
  );

  const comparison = await getWebsiteStats(websiteId, {
    ...filters,
    startDate,
    endDate,
  });

  return json({ ...data, comparison });
}
