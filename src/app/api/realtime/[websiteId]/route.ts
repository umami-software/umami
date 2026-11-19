import { startOfMinute, subMinutes } from 'date-fns';
import { z } from 'zod';
import { REALTIME_RANGE } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, timezoneParam, unitParam } from '@/lib/schema';
import { canViewWebsiteSection, canViewWebsiteSectionRows } from '@/permissions';
import { getRealtimeData } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    timezone: timezoneParam.optional(),
    unit: unitParam.optional(),
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  // Board shares can read realtime aggregates but not the per-visitor event log.
  const canViewRows = await canViewWebsiteSectionRows(auth, websiteId, 'realtime');

  if (!canViewRows && !(await canViewWebsiteSection(auth, websiteId, 'realtime'))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(
    {
      ...query,
      startAt: subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime(),
      endAt: Date.now(),
    },
    websiteId,
  );

  const data = await getRealtimeData(websiteId, filters);

  return json(canViewRows ? data : { ...data, events: [] });
}
