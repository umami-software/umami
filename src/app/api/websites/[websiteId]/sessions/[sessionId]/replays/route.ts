import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getSessionReplays } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const schema = withDateRange({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const data = await getSessionReplays(websiteId, filters, sessionId);

  return json(data);
}
