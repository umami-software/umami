import { z } from 'zod';
import { min } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { parseDateRange } from '@/lib/date';
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
  const defaultRange = parseDateRange('7day', undefined, undefined, timezone);
  const hasDateRange = resolvedQuery.startAt != null && resolvedQuery.endAt != null;
  const startDate = hasDateRange
    ? new Date(resolvedQuery.startAt)
    : fromZonedTime(defaultRange.startDate, timezone);
  // The default range runs to the end of today; stop at now so the hours still
  // to come don't show up as an empty bucket at the end of the sparkline
  const endDate = min([
    hasDateRange ? new Date(resolvedQuery.endAt) : fromZonedTime(defaultRange.endDate, timezone),
    new Date(),
  ]);

  const websiteIds = await canViewBatchWebsites(auth, query.ids);

  const data = await getWebsiteListCharts(websiteIds, {
    startDate,
    endDate,
    timezone,
  });

  return json({ data });
}
