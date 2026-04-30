import { z } from 'zod';
import { parsePropertyFilters } from '@/lib/params';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getSessionDataProperties } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    selectedPropertyName: z.string().optional(),
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

  const { selectedPropertyName, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);
  const propertyFilters = parsePropertyFilters(query);

  const data = await getSessionDataProperties(
    websiteId,
    filters,
    propertyFilters,
    selectedPropertyName,
  );

  return json(data);
}
