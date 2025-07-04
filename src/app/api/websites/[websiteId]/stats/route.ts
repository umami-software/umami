import { z } from 'zod';
import { parseRequest, getQueryFilters, setWebsiteDate } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { filterParams } from '@/lib/schema';
import { getWebsiteStats } from '@/queries';
import { getCompareDate } from '@/lib/date';

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

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await setWebsiteDate(websiteId, getQueryFilters(query));

  const data = await getWebsiteStats(websiteId, filters);

  const { startDate, endDate } = getCompareDate('prev', filters.startDate, filters.endDate);

  const comparison = await getWebsiteStats(websiteId, {
    ...filters,
    startDate,
    endDate,
  });

  return json({ ...data, comparison });
}
