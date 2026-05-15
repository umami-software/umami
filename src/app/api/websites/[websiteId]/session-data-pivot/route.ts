import { z } from 'zod';
import { parsePropertyFilters } from '@/lib/params';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams, timezoneParam, unitParam } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getSessionDataPivot } from '@/queries/sql/sessions/getSessionDataPivot';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    propertyName: z.string(),
    timezone: timezoneParam.optional(),
    unit: unitParam.optional(),
    ...filterParams,
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { propertyName, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);
  const propertyFilters = parsePropertyFilters(query);
  const result = await getSessionDataPivot(websiteId, propertyName, filters, propertyFilters);

  return json(result);
}
