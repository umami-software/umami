import { canViewWebsite } from '@/permissions';
import { json, unauthorized } from '@/lib/response';
import { getActiveVisitors } from '@/queries/sql';
import { parseRequest } from '@/lib/request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const visitors = await getActiveVisitors(websiteId);

  return json(visitors);
}
