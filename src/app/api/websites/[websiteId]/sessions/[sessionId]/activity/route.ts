import { endOfMonth, startOfMonth } from 'date-fns';
import { z } from 'zod';
import { FIELD_LENGTH } from '@/lib/constants';
import { getQueryFilters, parseRequest, resolvePeriodDateRange } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import type { SessionActivity } from '@/lib/types';
import { withPeriodDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { getLinkedDistinctIds, getLinkedSessionIds, getSessionActivity } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const schema = withPeriodDateRange({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    distinctId: z.string().max(FIELD_LENGTH.distinctId).optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, 'sessions'))) {
    return unauthorized();
  }

  let sessionIds = [sessionId];
  const dateRange = resolvePeriodDateRange(query);
  let startAt = dateRange.startAt;
  let endAt = dateRange.endAt;
  const distinctIds = query.distinctId
    ? [query.distinctId]
    : await getLinkedDistinctIds(websiteId, sessionId);

  if (distinctIds.length === 1) {
    const links = await getLinkedSessionIds(websiteId, distinctIds[0]);
    const linkedIds = links.map(link => link.sessionId);
    const linkedDates = links
      .map(link => +new Date(link.createdAt))
      .filter(timestamp => !Number.isNaN(timestamp));

    sessionIds = Array.from(new Set([sessionId, ...linkedIds]));

    if (sessionIds.length > 1 && linkedDates.length) {
      startAt = Math.min(startAt, +startOfMonth(new Date(Math.min(...linkedDates))));
      endAt = Math.max(endAt, +endOfMonth(new Date(Math.max(...linkedDates))));
    }
  }

  const filters = await getQueryFilters({ ...query, period: undefined, startAt, endAt }, websiteId);

  const data = (await getSessionActivity(websiteId, sessionIds, filters)) as SessionActivity[];

  return json(data);
}
