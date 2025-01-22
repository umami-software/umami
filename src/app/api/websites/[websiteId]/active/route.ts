import { canViewWebsite, checkAuth } from 'lib/auth';
import { json, unauthorized } from 'lib/response';
import { getActiveVisitors } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await getActiveVisitors(websiteId);

  return json(result);
}
