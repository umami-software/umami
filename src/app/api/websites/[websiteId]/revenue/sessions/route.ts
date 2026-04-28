import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams, searchParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getRevenueSessions } from '@/queries/sql/reports/getRevenueSessions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    currency: z.string(),
    ...filterParams,
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { currency, ...rest } = query;
  const filters = await getQueryFilters(rest, websiteId);

  const data = await getRevenueSessions(websiteId, currency, filters);

  return json(data);
}
