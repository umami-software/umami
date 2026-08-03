import { z } from 'zod';
import { FIELD_LENGTH } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import {
  getLinkedDistinctIds,
  getLinkedSessionIds,
  getSessionActivity,
  getSessionActivityBounds,
} from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    distinctId: z.string().max(FIELD_LENGTH.distinctId).optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (
    !(await canViewWebsiteSection(auth, websiteId, ['sessions', 'events', 'realtime', 'revenue']))
  ) {
    return unauthorized();
  }

  let sessionIds = [sessionId];
  let startAt = query.startAt;
  let endAt = query.endAt;
  const distinctIds = query.distinctId
    ? [query.distinctId]
    : await getLinkedDistinctIds(websiteId, sessionId);

  if (distinctIds.length) {
    const links = await Promise.all(distinctIds.map(distinctId => getLinkedSessionIds(websiteId, distinctId)));
    const linkedIds = links.flatMap(group => group.map(link => link.sessionId));

    sessionIds = Array.from(new Set([sessionId, ...linkedIds]));

    if (sessionIds.length > 1) {
      const bounds = await getSessionActivityBounds(websiteId, sessionIds);

      if (bounds?.firstAt && bounds?.lastAt) {
        startAt = Math.min(startAt, +new Date(bounds.firstAt));
        endAt = Math.max(endAt, +new Date(bounds.lastAt));
      }
    }
  }

  const filters = await getQueryFilters({ ...query, startAt, endAt }, websiteId);

  const data = await getSessionActivity(websiteId, sessionIds, filters);

  return json(data);
}
