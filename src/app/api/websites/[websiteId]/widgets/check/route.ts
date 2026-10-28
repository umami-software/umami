import { rateLimit } from '@/lib/rate-limit';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { checkWidgetInstall } from '@/lib/site-check';
import { canUpdateWebsite } from '@/permissions';
import { getWebsite } from '@/queries/prisma';

/** Does the website's homepage contain the widgets snippet for this website id? */
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

  if (!rateLimit(`check:${auth.user.id}`, 20, 60_000)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const website = await getWebsite(websiteId);

  if (!website?.domain) {
    return badRequest({ message: 'Set the website domain first.' });
  }

  return json(await checkWidgetInstall(website.domain, websiteId));
}
