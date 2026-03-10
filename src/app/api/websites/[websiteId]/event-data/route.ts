import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getEventData } from '@/queries/sql/events/getEventData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
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

  const filters = await getQueryFilters(query, websiteId);

  const rows = await getEventData(websiteId, filters);

  const eventMap = new Map<
    string,
    { websiteId: string; eventId: string; eventName: string; eventProperties: object[] }
  >();

  for (const { websiteId, eventId, eventName, ...props } of rows) {
    let entry = eventMap.get(eventId);
    if (!entry) {
      entry = { websiteId, eventId, eventName, eventProperties: [] };
      eventMap.set(eventId, entry);
    }
    entry.eventProperties.push(props);
  }

  return json([...eventMap.values()]);
}
