import { canViewWebsite } from '@/lib/auth';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getSessionDataValues } from '@/queries';
import { z } from 'zod';

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

  const { propertyName } = query;
  const { websiteId } = await params;
  const filters = await getQueryFilters({ ...query, websiteId });

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getSessionDataValues(websiteId, {
    ...filters,
    propertyName,
  });

  return json(data);
}
