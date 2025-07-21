import { z } from 'zod';
import { parseRequest, getRequestDateRange, getRequestFilters } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { filterParams, timezoneParam, unitParam } from '@/lib/schema';
import { getEventStats } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    unit: unitParam,
    timezone: timezoneParam,
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { timezone } = query;
  const { startDate, endDate, unit } = await getRequestDateRange(query);

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = {
    ...(await getRequestFilters(query)),
    startDate,
    endDate,
    timezone,
    unit,
  };

  const data = await getEventStats(websiteId, filters);

  return json(data);
}
