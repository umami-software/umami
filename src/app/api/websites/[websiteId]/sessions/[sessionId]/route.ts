import { isRelationalOnly } from '@/lib/db';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, ok, unauthorized } from '@/lib/response';
import { canDeleteWebsite, canViewWebsiteSection } from '@/permissions';
import { deleteSession } from '@/queries/prisma';
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
  const canDelete = isRelationalOnly() && (await canDeleteWebsite(auth, websiteId));

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
    canDelete,
    stitchedSessionCount,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!isRelationalOnly()) {
    return badRequest({ message: 'Session deletion is only available with relational storage.' });
  }

  const { websiteId, sessionId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const deletedSession = await deleteSession(websiteId, sessionId);

  if (!deletedSession) {
    return notFound();
  }

  return ok();
}
