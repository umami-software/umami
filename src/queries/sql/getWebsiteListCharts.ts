import { addHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteListCharts';
const DEFAULT_TIMEZONE = 'UTC';
const BUCKET_HOURS = 12;

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
    eventType,
  }: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    eventType?: number;
  },
): Promise<Record<string, WebsiteListChartData>> {
  if (!websiteIds.length) {
    return {};
  }

  return runQuery({
    [PRISMA]: async () => {
      const points = await relationalQuery(websiteIds, startDate, endDate, timezone, eventType);

      return formatResults({ points, websiteIds, startDate, endDate, timezone });
    },
    [CLICKHOUSE]: async () => {
      const points = await clickhouseQuery(websiteIds, startDate, endDate, timezone, eventType);

      return formatResults({ points, websiteIds, startDate, endDate, timezone });
    },
  });
}

async function relationalQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
  timezone: string,
  eventType?: number,
): Promise<WebsiteListChartPoint[]> {
  const { rawQuery } = prisma;
  const eventTypeQuery =
    eventType != null
      ? `and website_event.event_type = ${eventType}`
      : `and website_event.event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`;
  const bucketSql =
    timezone.toLowerCase() === 'utc'
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
  eventType?: number,
): Promise<WebsiteListChartPoint[]> {
  const { rawQuery } = clickhouse;
  const eventTypeQuery =
    eventType != null
      ? `and event_type = ${eventType}`
      : `and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`;
  const localTime = `toTimeZone(website_event.created_at, '${timezone}')`;
  const bucketSql = `
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

function formatResults(
  {
    points,
    websiteIds,
    startDate,
    endDate,
    timezone,
  }: {
    points: WebsiteListChartPoint[];
    websiteIds: string[];
    startDate: Date;
    endDate: Date;
    timezone: string;
  },
) {
  const buckets: string[] = [];

  for (
    let current = new Date(startDate);
    current <= endDate;
    current = addHours(current, BUCKET_HOURS)
  ) {
    buckets.push(formatInTimeZone(current, timezone, 'yyyy-MM-dd HH:00:00'));
  }

  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket, index]));
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

    const index = bucketIndex.get(String(x).slice(0, 19));

    if (index !== undefined) {
      charts[websiteId].values[index] = Number(y);
    }
  });

  return charts;
}
