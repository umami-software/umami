import { z } from 'zod';
import { checkRequest, getRequestDateRange, getRequestFilters } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { filterParams, timezoneParam, unitParam } from 'lib/schema';
import { getEventMetrics } from 'queries';

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

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { timezone } = query;
  const { startDate, endDate, unit } = await getRequestDateRange(request);

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = {
    ...getRequestFilters(request),
    startDate,
    endDate,
    timezone,
    unit,
  };

  const data = await getEventMetrics(websiteId, filters);

  return json(data);
}
