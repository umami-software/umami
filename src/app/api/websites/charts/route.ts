import { z } from 'zod';
import { getWebsiteListDateRange } from '@/lib/date';
import { canViewBatchWebsites } from '@/permissions/website';
import { parseRequest, resolvePeriodDateRange } from '@/lib/request';
import { json } from '@/lib/response';
import { timezoneParam, withPeriodDateRange } from '@/lib/schema';
import { getWebsiteListCharts } from '@/queries/sql';

const schema = withPeriodDateRange({
  ids: z
    .string()
    .transform(value => value.split(',').map(item => item.trim()).filter(Boolean))
    .pipe(z.array(z.uuid()).min(1).max(20)),
  startAt: z.coerce.number().int().optional(),
  endAt: z.coerce.number().int().optional(),
  timezone: timezoneParam.optional(),
}, false);

export async function GET(request: Request) {
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const resolvedQuery = resolvePeriodDateRange(query);
  const timezone = resolvedQuery.timezone || 'UTC';
  const hasDateRange = resolvedQuery.startAt != null && resolvedQuery.endAt != null;
  const { startDate, endDate } = hasDateRange
    ? { startDate: new Date(resolvedQuery.startAt), endDate: new Date(resolvedQuery.endAt) }
    : getWebsiteListDateRange(timezone);

  const websiteIds = await canViewBatchWebsites(auth, query.ids);

  const data = await getWebsiteListCharts(websiteIds, {
    startDate,
    endDate,
    timezone,
  });

  return json({ data });
}
