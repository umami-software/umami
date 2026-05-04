import { z } from 'zod';
import { parsePropertyFilters } from '@/lib/params';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, timezoneParam, unitParam } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getSessionDataNumericSeries } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    propertyName: z.string(),
    metric: z.enum(['sum', 'avg', 'count']).default('sum'),
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

  const { propertyName, metric, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);
  const propertyFilters = parsePropertyFilters(query);
  const data = await getSessionDataNumericSeries(websiteId, propertyName, metric, filters, propertyFilters);

  return json(data);
}
