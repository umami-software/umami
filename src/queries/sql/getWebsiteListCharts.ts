import { addHours, addMinutes } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteListCharts';
const DEFAULT_TIMEZONE = 'UTC';
const BUCKET_HOURS = 12;

// Used when no unit is given: the endpoint keeps its original 12-hour
// bucketing so existing callers see an unchanged response.
const DEFAULT_UNIT = 'default';

// Upper bound on the generated series. Unlike the other chart endpoints this
// one fills gaps server-side, so an unbounded range at a fine resolution
// (a year of minutes is over 500k points) would build huge dense arrays for
// up to 20 websites at once.
//
// The route rejects oversized ranges up front — truncating would leave
// `values` contradicting the full-range `total`. The check in the loops below
// is a backstop for direct callers of this function.
export const MAX_BUCKETS = 10000;

// Units that are true durations and can be stepped on absolute time.
const BUCKET_STEP: Record<string, (date: Date, timezone: string) => Date> = {
  [DEFAULT_UNIT]: date => addHours(date, BUCKET_HOURS),
  minute: date => addMinutes(date, 1),
  hour: date => addHours(date, 1),
};

// Units where a bucket is a calendar span, not a fixed duration: a local day
// is 23 or 25 hours long across a DST transition.
const CALENDAR_UNITS = new Set(['day', 'month', 'year']);

/** The local calendar date (YYYY-MM-DD) a bucket starts on. */
function calendarStart(date: Date, unit: string, timezone: string): string {
  const [year, month, day] = formatInTimeZone(date, timezone, 'yyyy-MM-dd').split('-');

  if (unit === 'year') {
    return `${year}-01-01`;
  }

  if (unit === 'month') {
    return `${year}-${month}-01`;
  }

  return `${year}-${month}-${day}`;
}

/** The local calendar date one bucket later. Pure date arithmetic, no offsets. */
function nextCalendarDate(date: string, unit: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));

  if (unit === 'year') {
    next.setUTCFullYear(next.getUTCFullYear() + 1, 0, 1);
  } else if (unit === 'month') {
    next.setUTCMonth(next.getUTCMonth() + 1, 1);
  } else {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next.toISOString().slice(0, 10);
}

interface WebsiteListChartPoint {
  websiteId: string;
  x: string | null;
  y: number;
}

export interface WebsiteListChartData {
  values: number[];
  total: number;
}

export async function getWebsiteListCharts(
  websiteIds: string[],
  {
    startDate,
    endDate,
    timezone = DEFAULT_TIMEZONE,
    unit = DEFAULT_UNIT,
    eventType,
  }: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    eventType?: number;
  },
): Promise<Record<string, WebsiteListChartData>> {
  if (!websiteIds.length) {
    return {};
  }

  return runQuery({
    [PRISMA]: async () => {
      const points = await relationalQuery(
        websiteIds,
        startDate,
        endDate,
        timezone,
        unit,
        eventType,
      );

      return formatResults({ points, websiteIds, startDate, endDate, timezone, unit });
    },
    [CLICKHOUSE]: async () => {
      const points = await clickhouseQuery(
        websiteIds,
        startDate,
        endDate,
        timezone,
        unit,
        eventType,
      );

      return formatResults({ points, websiteIds, startDate, endDate, timezone, unit });
    },
  });
}

async function relationalQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
  timezone: string,
  unit: string,
  eventType?: number,
): Promise<WebsiteListChartPoint[]> {
  const { rawQuery, getDateSQL } = prisma;
  const eventTypeQuery =
    eventType != null
      ? `and website_event.event_type = ${eventType}`
      : `and website_event.event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`;
  // The 12-hour default bucket has no equivalent in getDateSQL and keeps its
  // hand-rolled truncation. Every real unit reuses the shared helper.
  const bucketSql =
    unit !== DEFAULT_UNIT
      ? getDateSQL('website_event.created_at', unit, timezone)
      : timezone.toLowerCase() === 'utc'
        ? `
        to_char(
          date_trunc('day', website_event.created_at)
          + floor(extract(hour from website_event.created_at) / ${BUCKET_HOURS}) * interval '${BUCKET_HOURS} hour',
          'YYYY-MM-DD HH24:00:00'
        )
      `
        : `
        to_char(
          date_trunc('day', website_event.created_at at time zone '${timezone}')
          + floor(extract(hour from website_event.created_at at time zone '${timezone}') / ${BUCKET_HOURS}) * interval '${BUCKET_HOURS} hour',
          'YYYY-MM-DD HH24:00:00'
        )
      `;

  return rawQuery(
    `
    select
      "websiteId",
      x,
      count(distinct session_id) as y
    from (
      select
        website_event.website_id as "websiteId",
        ${bucketSql} as x,
        website_event.session_id
      from website_event
      where website_event.website_id = any({{websiteIds}}::uuid[])
        ${eventTypeQuery}
        and website_event.created_at between {{startDate}} and {{endDate}}
    ) as events
    group by grouping sets (("websiteId", x), ("websiteId"))
    order by 1, 2
    `,
    { websiteIds, startDate, endDate },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
  timezone: string,
  unit: string,
  eventType?: number,
): Promise<WebsiteListChartPoint[]> {
  const { rawQuery, getDateSQL } = clickhouse;
  const eventTypeQuery =
    eventType != null
      ? `and event_type = ${eventType}`
      : `and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`;
  const localTime = `toTimeZone(website_event.created_at, '${timezone}')`;
  // getDateSQL returns a DateTime, but the GROUPING SETS subtotal row needs to
  // be distinguishable from a real bucket. A DateTime subtotal comes back as
  // the epoch (1970-01-01 …) rather than an empty value, which formatResults
  // would treat as an ordinary — and unmatched — data point, losing the total.
  // Formatting to a String keeps the subtotal empty, as on the default path.
  const bucketSql =
    unit !== DEFAULT_UNIT
      ? `formatDateTime(${getDateSQL('website_event.created_at', unit, timezone)}, '%Y-%m-%d %T')`
      : `
    formatDateTime(
      toStartOfDay(${localTime}) + toIntervalHour(intDiv(toHour(${localTime}), ${BUCKET_HOURS}) * ${BUCKET_HOURS}),
      '%Y-%m-%d %H:00:00'
    )
  `;

  return rawQuery(
    `
    select
      website_id as websiteId,
      ${bucketSql} as x,
      uniq(session_id) as y
    from website_event_stats_hourly as website_event
    where website_id in {websiteIds:Array(UUID)}
      ${eventTypeQuery}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by grouping sets ((website_id, x), (website_id))
    order by websiteId, x
    `,
    { websiteIds, startDate, endDate },
    FUNCTION_NAME,
  );
}

/**
 * Snaps a date down to the start of its bucket in the target timezone, so the
 * generated labels line up with the truncated values the database returns.
 *
 * Without this, a startDate that is not already on a bucket boundary produces
 * labels that never match any row, and every bucket silently reads back as 0
 * while `total` stays correct.
 */
function startOfBucket(date: Date, unit: string, timezone: string): Date {
  const local = toZonedTime(date, timezone);

  switch (unit) {
    case 'minute':
      local.setSeconds(0, 0);
      break;
    case 'hour':
      local.setMinutes(0, 0, 0);
      break;
    case 'day':
      local.setHours(0, 0, 0, 0);
      break;
    case 'month':
      local.setHours(0, 0, 0, 0);
      local.setDate(1);
      break;
    case 'year':
      local.setHours(0, 0, 0, 0);
      local.setMonth(0, 1);
      break;
    default:
      // The default 12-hour buckets start at 00:00 and 12:00 local time.
      local.setHours(Math.floor(local.getHours() / BUCKET_HOURS) * BUCKET_HOURS, 0, 0, 0);
      break;
  }

  const snapped = fromZonedTime(local, timezone);

  // In the repeated hour of an autumn DST transition the local time is
  // ambiguous and resolves to its second occurrence, which would place the
  // bucket start after the requested start. Step back one hour in that case.
  return snapped > date ? addHours(snapped, -1) : snapped;
}

/**
 * Normalises a formatted date into a comparable key.
 *
 * The backends disagree on how a truncated date is rendered: Postgres pads to
 * `YYYY-MM-DD HH:00:00`, ClickHouse drops the time for day and coarser units,
 * and the UTC paths emit ISO strings with a `T` and a trailing `Z`. Reducing
 * all of them to `YYYY-MM-DD HH:mm` keeps the lookup format-agnostic.
 */
function bucketKey(value: string): string {
  const [date, time = '00:00'] = value.replace('T', ' ').replace('Z', '').trim().split(' ');

  return `${date} ${time.slice(0, 5)}`;
}

/**
 * How many buckets a range would produce. Lets the route reject an oversized
 * request before any query runs.
 */
export function countBuckets(
  startDate: Date,
  endDate: Date,
  timezone = DEFAULT_TIMEZONE,
  unit = DEFAULT_UNIT,
): number {
  const span = endDate.getTime() - startDate.getTime();

  if (span < 0) {
    return 0;
  }

  switch (unit) {
    case 'minute':
      return Math.floor(span / 60_000) + 1;
    case 'hour':
      return Math.floor(span / 3_600_000) + 1;
    case 'year':
    case 'month':
    case 'day': {
      // Calendar units vary in length, so count them on the local calendar.
      let count = 0;
      let date = calendarStart(startDate, unit, timezone);

      while (
        fromZonedTime(`${date} 00:00:00`, timezone) <= endDate &&
        count <= MAX_BUCKETS
      ) {
        count += 1;
        date = nextCalendarDate(date, unit);
      }

      return count;
    }
    default:
      return Math.floor(span / (BUCKET_HOURS * 3_600_000)) + 1;
  }
}

function formatResults({
  points,
  websiteIds,
  startDate,
  endDate,
  timezone,
  unit,
}: {
  points: WebsiteListChartPoint[];
  websiteIds: string[];
  startDate: Date;
  endDate: Date;
  timezone: string;
  unit: string;
}) {
  const buckets: string[] = [];
  // Minutes must survive into the label, otherwise every bucket of an hour
  // collapses onto the same key.
  const format = unit === 'minute' ? 'yyyy-MM-dd HH:mm:00' : 'yyyy-MM-dd HH:00:00';

  if (CALENDAR_UNITS.has(unit)) {
    // Calendar units advance on the local date itself. Deriving the next date
    // from the previous instant would stall in zones whose DST transition is at
    // midnight: the bucket for such a day resolves to 23:00 of the day before,
    // which reads back as the earlier date and never moves on.
    let date = calendarStart(startDate, unit, timezone);

    for (
      let current = fromZonedTime(`${date} 00:00:00`, timezone);
      current <= endDate && buckets.length < MAX_BUCKETS;
      current = fromZonedTime(`${(date = nextCalendarDate(date, unit))} 00:00:00`, timezone)
    ) {
      // Label from the calendar date, not from the instant: where local
      // midnight does not exist (a DST transition at 00:00) the instant sits at
      // 23:00 the day before, while the database still truncates to that day.
      buckets.push(`${date} 00:00:00`);
    }
  } else {
    const step = BUCKET_STEP[unit] ?? BUCKET_STEP[DEFAULT_UNIT];

    for (
      let current = startOfBucket(startDate, unit, timezone);
      current <= endDate && buckets.length < MAX_BUCKETS;
      current = step(current, timezone)
    ) {
      buckets.push(formatInTimeZone(current, timezone, format));
    }
  }

  // The repeated hour of an autumn DST transition renders to the same local
  // label twice, and the database collapses both into one row. Keeping the
  // first index puts that row in the earlier of the two buckets instead of
  // leaving a gap before it.
  const bucketIndex = new Map<string, number>();

  buckets.forEach((bucket, index) => {
    const key = bucketKey(bucket);

    if (!bucketIndex.has(key)) {
      bucketIndex.set(key, index);
    }
  });
  const charts = websiteIds.reduce<Record<string, WebsiteListChartData>>((result, websiteId) => {
    result[websiteId] = {
      values: Array.from({ length: buckets.length }, () => 0),
      total: 0,
    };
    return result;
  }, {});

  points.forEach(({ websiteId, x, y }) => {
    if (!charts[websiteId]) {
      return;
    }

    // Subtotal rows from GROUPING SETS (null x on Postgres, '' on ClickHouse)
    // carry the window-wide distinct total per website
    if (!x) {
      charts[websiteId].total = Number(y);
      return;
    }

    const index = bucketIndex.get(bucketKey(String(x)));

    if (index !== undefined) {
      charts[websiteId].values[index] = Number(y);
    }
  });

  return charts;
}
