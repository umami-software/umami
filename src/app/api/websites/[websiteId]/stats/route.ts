import { z } from 'zod';
import { parseRequest, getQueryFilters } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { dateRangeParams, filterParams } from '@/lib/schema';
import { getWebsiteStats } from '@/queries/sql';
import { getCompareDate } from '@/lib/date';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    ...dateRangeParams,
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

  const data = await getWebsiteStats(websiteId, filters);

  const { startDate, endDate } = getCompareDate('prev', filters.startDate, filters.endDate);

  const comparison = await getWebsiteStats(websiteId, {
    ...filters,
    startDate,
    endDate,
  });

  return json({ ...data, comparison });
}
