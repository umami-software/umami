import { z } from 'zod';
import { checkRequest } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { getEventDataEvents } from 'queries/analytics/events/getEventDataEvents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    propertyName: z.string().optional(),
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { startAt, endAt, event } = query;
  const { websiteId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  const data = await getEventDataEvents(websiteId, {
    startDate,
    endDate,
    event,
  });

  return json(data);
}
