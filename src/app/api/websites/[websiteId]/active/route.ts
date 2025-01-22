import { canViewWebsite, checkAuth } from 'lib/auth';
import { json, unauthorized } from 'lib/response';
import { getActiveVisitors } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await getActiveVisitors(websiteId);

  return json(result);
}
