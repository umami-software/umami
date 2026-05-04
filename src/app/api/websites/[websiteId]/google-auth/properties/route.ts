import { getGscProperties, getValidAccessToken } from '@/lib/google';
import { parseRequest } from '@/lib/request';
import { json, serverError, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const accessToken = await getValidAccessToken(websiteId);
    const properties = await getGscProperties(accessToken);
    return json({ properties });
  } catch (err: any) {
    return serverError({ message: err?.message ?? 'Failed to fetch properties' });
  }
}
