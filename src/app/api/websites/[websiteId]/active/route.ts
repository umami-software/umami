import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection, getShareParametersForWebsite } from '@/permissions';
import { getActiveVisitors } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, ['overview', 'realtime']))) {
    return unauthorized();
  }

  const shareParams = await getShareParametersForWebsite(auth, websiteId);

  const filters =
    shareParams?.filters?.length || shareParams?.segment
      ? await getQueryFilters({}, websiteId, auth)
      : undefined;

  const visitors = await getActiveVisitors(websiteId, filters);

  return json(visitors);
}
