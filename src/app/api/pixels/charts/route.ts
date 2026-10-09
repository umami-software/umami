import { z } from 'zod';
import { fromZonedTime } from 'date-fns-tz';
import { EVENT_TYPE } from '@/lib/constants';
import { parseDateRange } from '@/lib/date';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { timezoneParam } from '@/lib/schema';
import { canViewPixel } from '@/permissions';
import { getWebsiteListCharts } from '@/queries/sql';

const schema = z.object({
  ids: z
    .string()
    .transform(value => value.split(',').map(item => item.trim()).filter(Boolean))
    .pipe(z.array(z.uuid()).min(1).max(20)),
  startAt: z.coerce.number().int().optional(),
  endAt: z.coerce.number().int().optional(),
  timezone: timezoneParam.optional(),
});

export async function GET(request: Request) {
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const timezone = query.timezone || 'UTC';
  const defaultRange = parseDateRange('7day', undefined, undefined, timezone);
  const hasDateRange = query.startAt != null && query.endAt != null;
  const startDate = hasDateRange
    ? new Date(query.startAt)
    : fromZonedTime(defaultRange.startDate, timezone);
  const endDate = hasDateRange ? new Date(query.endAt) : fromZonedTime(defaultRange.endDate, timezone);

  const pixelIds = (
    await Promise.all(
      query.ids.map(async (pixelId: string) =>
        (await canViewPixel(auth, pixelId)) ? pixelId : null,
      ),
    )
  ).filter(Boolean);

  const data = await getWebsiteListCharts(pixelIds, {
    startDate,
    endDate,
    timezone,
    eventType: EVENT_TYPE.pixelEvent,
  });

  return json({ data });
}
