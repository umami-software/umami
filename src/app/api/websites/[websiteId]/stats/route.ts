import { z } from 'zod';
import { parseRequest, getRequestDateRange, getRequestFilters } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { getCompareDate } from '@/lib/date';
import { filterParams } from '@/lib/schema';
import { getWebsiteStats } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    compare: z.string().optional(),
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { compare } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
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

  const previous = await getWebsiteStats(websiteId, {
    ...filters,
    startDate: compareStartDate,
    endDate: compareEndDate,
  });

  return json({ ...metrics, previous });
}
