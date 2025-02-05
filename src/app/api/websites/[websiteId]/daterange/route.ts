import { canViewWebsite } from '@/lib/auth';
import { getWebsiteDateRange } from '@/queries';
import { json, unauthorized } from '@/lib/response';
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

  const result = await getWebsiteDateRange(websiteId);

  return json(result);
}
