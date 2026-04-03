import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getOutboundLinkMetrics } from '@/queries/sql/events/getOutboundLinkMetrics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    ...filterParams,
    type: z.enum(['url', 'domain']).default('domain'),
    limit: z.coerce.number().int().positive().max(100).default(10),
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

  const data = await getOutboundLinkMetrics(websiteId, {
    ...filters,
    type: query.type,
    limit: query.limit,
  });

  return json(data);
}
