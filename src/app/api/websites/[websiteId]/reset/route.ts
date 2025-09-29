import { canUpdateWebsite } from '@/permissions';
import { resetWebsite } from '@/queries/prisma';
import { unauthorized, ok } from '@/lib/response';
import { parseRequest } from '@/lib/request';

export async function POST(
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

  await resetWebsite(websiteId);

  return ok();
}
