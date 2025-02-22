import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { getEventDataProperties } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    propertyName: z.string().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { startAt, endAt, propertyName } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  const data = await getEventDataProperties(websiteId, { startDate, endDate, propertyName });

  return json(data);
}
