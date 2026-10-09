import { z } from 'zod';
import { fetchQuery } from '@/lib/queryCache';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { getEventDataValues } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    eventName: z.string().optional(),
    propertyName: z.string(),
    dataType: z.coerce.number().int().optional(),
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, 'events'))) {
    return unauthorized();
  }

  const { eventName, propertyName, dataType } = query;
  const filters = await getQueryFilters(query, websiteId);

  const data = await fetchQuery(websiteId, 'event-data-values', query, filters.endDate, () => getEventDataValues(websiteId, eventName, {
    ...filters,
    propertyName,
    dataType,
  }));

  return json(data);
}
