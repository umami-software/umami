import { z } from 'zod';
import { parseEventPropertyFilters } from '@/lib/params';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, timezoneParam, unitParam } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getEventDataArraySeries } from '@/queries/sql/events/getEventDataArraySeries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    eventName: z.string(),
    propertyName: z.string(),
    timezone: timezoneParam.optional(),
    unit: unitParam.optional(),
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

  const { eventName, propertyName, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);
  const eventFilters = parseEventPropertyFilters(query);
  const data = await getEventDataArraySeries(websiteId, eventName, propertyName, filters, eventFilters);

  return json(data);
}
