import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getEventDataValues } from '@/queries/sql';
import { dateRangeParams, filterParams } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    eventName: z.string().optional(),
    propertyName: z.string().optional(),
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

  const { eventName, propertyName } = query;
  const filters = await getQueryFilters(query, websiteId);

  const data = await getEventDataValues(websiteId, {
    ...filters,
    eventName,
    propertyName,
  });

  return json(data);
}
