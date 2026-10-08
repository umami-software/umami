import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { createReplayView } from '@/queries/prisma/sessionReplay';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await createReplayView(auth.user.id, websiteId, replayId);

  return json({ ok: true });
}
