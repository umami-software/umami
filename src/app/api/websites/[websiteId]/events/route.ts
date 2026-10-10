import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams, searchParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { getWebsiteEvents } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    ...filterParams,
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, 'events'))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const data = await getWebsiteEvents(websiteId, filters);

  return json(data);
}
