import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
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

  const visitors = await getActiveVisitors(websiteId);

  return json(visitors);
}
