import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { getRequestDateRange, parseRequest } from '@/lib/request';
import { getRetention } from '@/queries';
import { filterParams, timezoneParam, unitParam } from '@/lib/schema';

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

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(query);

  const data = await getRetention(websiteId, {
    startDate,
    endDate,
    timezone,
  });

  return json(data);
}
