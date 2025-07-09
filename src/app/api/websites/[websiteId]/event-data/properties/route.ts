import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
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

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { propertyName } = query;
  const filters = getQueryFilters(query);

  const data = await getEventDataProperties(websiteId, { ...filters, propertyName });

  return json(data);
}
