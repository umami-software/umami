import { addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { normalizeTimezone } from '@/lib/date';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteListActivity';

export interface WebsiteListActivityFilters {
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

interface WebsiteListActivityBucket {
  websiteId: string;
  bucket: string;
  value: number;
}

export interface WebsiteListActivity {
  websiteId: string;
  activity: number[];
}

function getRequiredDateRange(filters: WebsiteListActivityFilters) {
  const { startDate, endDate } = filters;
  const hasValidStartDate = startDate instanceof Date && !Number.isNaN(startDate.getTime());
  const hasValidEndDate = endDate instanceof Date && !Number.isNaN(endDate.getTime());

  if (!hasValidStartDate || !hasValidEndDate) {
    throw new Error('startDate and endDate are required for getWebsiteListActivity');
  }

  return {
    startDate,
    endDate,
    timezone: filters.timezone ? normalizeTimezone(filters.timezone) : 'UTC',
  };
}

function formatResults(
  data: WebsiteListActivityBucket[],
  filters: WebsiteListActivityFilters,
): WebsiteListActivity[] {
  const { startDate, timezone } = getRequiredDateRange(filters);
  const buckets = Array.from({ length: 7 }, (_, index) =>
    formatInTimeZone(addDays(startDate, index), timezone, 'yyyy-MM-dd'),
  );
  const activityByWebsiteId = new Map<string, Map<string, number>>();

  data.forEach(({ websiteId, bucket, value }) => {
    const websiteBuckets = activityByWebsiteId.get(websiteId) || new Map<string, number>();

    websiteBuckets.set(bucket, Number(value) || 0);
    activityByWebsiteId.set(websiteId, websiteBuckets);
  });

  return Array.from(activityByWebsiteId.entries()).map(([websiteId, websiteBuckets]) => ({
    websiteId,
    activity: buckets.map(bucket => websiteBuckets.get(bucket) || 0),
  }));
}

export function getWebsiteListActivity(
  ...args: [websiteIds: string[], filters: WebsiteListActivityFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteIds: string[],
  filters: WebsiteListActivityFilters,
): Promise<WebsiteListActivity[]> {
  const { rawQuery } = prisma;
  const { startDate, endDate, timezone } = getRequiredDateRange(filters);

  const result = (await rawQuery(
    `
    select
      website_event.website_id as "websiteId",
      to_char(date_trunc('day', timezone({{timezone}}, website_event.created_at)), 'YYYY-MM-DD') as "bucket",
      cast(count(*) as bigint) as "value"
    from website_event
    where website_event.website_id = ANY({{websiteIds}}::uuid[])
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
    group by 1, 2
    order by 2
    `,
    {
      websiteIds,
      startDate,
      endDate,
      timezone,
    },
    FUNCTION_NAME,
  )) as WebsiteListActivityBucket[];

  return formatResults(result, { startDate, endDate, timezone });
}

async function clickhouseQuery(
  websiteIds: string[],
  filters: WebsiteListActivityFilters,
): Promise<WebsiteListActivity[]> {
  const { rawQuery } = clickhouse;
  const { startDate, endDate, timezone } = getRequiredDateRange(filters);

  const result = (await rawQuery(
    `
    select
      website_id as websiteId,
      formatDateTime(toTimezone(created_at, {timezone:String}), '%Y-%m-%d') as bucket,
      sum(views) as value
    from website_event_stats_hourly
    where website_id in {websiteIds:Array(UUID)}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
    group by website_id, bucket
    order by bucket
    `,
    {
      websiteIds,
      startDate,
      endDate,
      timezone,
    },
    FUNCTION_NAME,
  )) as WebsiteListActivityBucket[];

  return formatResults(result, { startDate, endDate, timezone });
}
