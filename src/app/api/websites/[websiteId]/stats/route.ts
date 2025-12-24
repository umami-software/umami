import { z } from 'zod';
import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { dateRangeParams, filterParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getWebsiteStats } from '@/queries/sql';

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
