import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { WebsiteStatsData } from './getWebsiteStats';

const FUNCTION_NAME = 'getMultipleWebsiteStats';

export async function getMultipleWebsiteStats(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<Record<string, WebsiteStatsData>> {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteIds, startDate, endDate),
    [CLICKHOUSE]: () => clickhouseQuery(websiteIds, startDate, endDate),
  });
}

async function relationalQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<Record<string, WebsiteStatsData>> {
  if (websiteIds.length === 0) return {};

  // $1 = startDate, $2 = endDate, $3...$N+2 = websiteIds
  const idPlaceholders = websiteIds.map((_, i) => `$${i + 3}::uuid`).join(', ');

  const rows = await prisma.client.$queryRawUnsafe<Array<WebsiteStatsData & { websiteId: string }>>(
    `
    select
      t.website_id::text as "websiteId",
      cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      coalesce(sum(case when t.c = 1 then 1 else 0 end), 0) as "bounces",
      cast(coalesce(sum(floor(extract(epoch from (t.max_time - t.min_time)))), 0) as bigint) as "totaltime"
    from (
      select
        website_id,
        session_id,
        visit_id,
        count(*) as c,
        min(created_at) as min_time,
        max(created_at) as max_time
      from website_event
      where website_id in (${idPlaceholders})
        and created_at between $1 and $2
        and event_type != 2
      group by website_id, session_id, visit_id
    ) as t
    group by t.website_id
    `,
    startDate,
    endDate,
    ...websiteIds,
  );

  if (process.env.LOG_QUERY) {
    console.debug(FUNCTION_NAME, { websiteIds, startDate, endDate, rows });
  }

  return Object.fromEntries(rows.map(({ websiteId, ...stats }) => [websiteId, stats]));
}

async function clickhouseQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<Record<string, WebsiteStatsData>> {
  if (websiteIds.length === 0) return {};

  const { rawQuery } = clickhouse;

  const rows = await rawQuery<Array<WebsiteStatsData & { websiteId: string }>>(
    `
    select
      website_id as "websiteId",
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sumIf(1, t.c = 1) as "bounces",
      sum(max_time - min_time) as "totaltime"
    from (
      select
        website_id,
        session_id,
        visit_id,
        sum(views) c,
        min(min_time) min_time,
        max(max_time) max_time
      from website_event_stats_hourly
      where website_id in {websiteIds:Array(UUID)}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != 2
      group by website_id, session_id, visit_id
    ) as t
    group by website_id
    `,
    { websiteIds, startDate, endDate },
    FUNCTION_NAME,
  );

  return Object.fromEntries(rows.map(({ websiteId, ...stats }) => [websiteId, stats]));
}
