import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getEventDataPivot } from '@/queries/sql/events/getEventDataPivot';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    eventName: z.string(),
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

  const { eventName, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);
  const result = await getEventDataPivot(websiteId, eventName, filters);

  return json(result);
}
