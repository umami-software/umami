import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteListStats';

export interface WebsiteListStatsFilters extends QueryFilters {
  startDate: Date;
  endDate: Date;
}

export interface WebsiteListStats {
  websiteId: string;
  pageviews: number;
  visitors: number;
}

function getRequiredDateRange(filters: WebsiteListStatsFilters) {
  const { startDate, endDate } = filters;
  const hasValidStartDate = startDate instanceof Date && !Number.isNaN(startDate.getTime());
  const hasValidEndDate = endDate instanceof Date && !Number.isNaN(endDate.getTime());

  if (!hasValidStartDate || !hasValidEndDate) {
    throw new Error('startDate and endDate are required for getWebsiteListStats');
  }

  return { startDate, endDate };
}

export function getWebsiteListStats(
  ...args: [websiteIds: string[], filters: WebsiteListStatsFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(
  websiteIds: string[],
  filters: WebsiteListStatsFilters,
): Promise<WebsiteListStats[]> {
  const { rawQuery } = prisma;
  const { startDate, endDate } = getRequiredDateRange(filters);

  return rawQuery(
    `
    select
      website_event.website_id as "websiteId",
      cast(count(*) as bigint) as "pageviews",
      cast(count(distinct website_event.session_id) as bigint) as "visitors"
    from website_event
    where website_event.website_id = ANY({{websiteIds}}::uuid[])
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
    group by website_event.website_id
    `,
    {
      websiteIds,
      startDate,
      endDate,
    },
    FUNCTION_NAME,
  );
}

function clickhouseQuery(
  websiteIds: string[],
  filters: WebsiteListStatsFilters,
): Promise<WebsiteListStats[]> {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = getRequiredDateRange(filters);

  return rawQuery(
    `
    select
      website_id as websiteId,
      sum(views) as pageviews,
      uniq(session_id) as visitors
    from website_event_stats_hourly
    where website_id in {websiteIds:Array(UUID)}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
    group by website_id
    `,
    {
      websiteIds,
      startDate,
      endDate,
    },
    FUNCTION_NAME,
  );
}
