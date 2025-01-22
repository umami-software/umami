import { canViewWebsite, checkAuth } from 'lib/auth';
import { getWebsiteDateRange } from 'queries';
import { json, unauthorized } from 'lib/response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await getWebsiteDateRange(websiteId);

  return json(result);
}
