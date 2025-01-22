import { canUpdateWebsite, checkAuth } from 'lib/auth';
import { resetWebsite } from 'queries';
import { unauthorized, ok } from 'lib/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await resetWebsite(websiteId);

  return ok();
}
