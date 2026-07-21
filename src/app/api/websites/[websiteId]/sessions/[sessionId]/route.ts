import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getLinkedDistinctIds, getLinkedSessionIds, getWebsiteSession } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (
    !(await canViewWebsiteSection(auth, websiteId, ['sessions', 'events', 'realtime', 'revenue']))
  ) {
    return unauthorized();
  }

  const data = await getWebsiteSession(websiteId, sessionId);

  if (!data) {
    return notFound();
  }

  let sessionIds = [sessionId];
  const distinctIds = data.distinctId
    ? [data.distinctId]
    : await getLinkedDistinctIds(websiteId, sessionId);

  if (!data.distinctId && distinctIds.length === 1) {
    data.distinctId = distinctIds[0];
  }

  if (distinctIds.length) {
    const links = await Promise.all(
      distinctIds.map(distinctId => getLinkedSessionIds(websiteId, distinctId)),
    );
    const linkedIds = links.flatMap(group => group.map(link => link.sessionId));

    sessionIds = Array.from(new Set([sessionId, ...linkedIds]));
  }

  const stitchedSessionCount = sessionIds.length;

  return json({
    ...data,
    stitchedSessionCount,
  });
}
