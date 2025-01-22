import { unauthorized, json } from 'lib/response';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { getWebsiteSession } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { websiteId, sessionId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteSession(websiteId, sessionId);

  return json(data);
}
