import { z } from 'zod';
import { getRequestDateRange, parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { getEventDataEvents } from '@/queries/sql/events/getEventDataEvents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    event: z.string().optional(),
  });
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { event } = query;
  const { startDate, endDate } = await getRequestDateRange(query);

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getEventDataEvents(websiteId, {
    startDate,
    endDate,
    event,
  });

  return json(data);
}
