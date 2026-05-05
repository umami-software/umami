import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteStats';

export interface WebsiteStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getWebsiteStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const { excludeBounce } = filters;
  const bounceQuery = excludeBounce ? '0' : 'coalesce(sum(case when t.c = 1 then 1 else 0 end), 0)';

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
      cast(coalesce(sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) as bigint) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}  
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by 1, 2
     
    ) as t
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';
  const { excludeBounce } = filters;
  const bounceQuery = excludeBounce ? '0' : 'sumIf(1, t.c = 1)';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        ${filterQuery}
      group by session_id, visit_id
    ) as t;
    `;
  } else {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      ${bounceQuery} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (select
            session_id,
            visit_id,
            sum(views) c,
            min(min_time) min_time,
            max(max_time) max_time
        from website_event_stats_hourly "website_event"
        ${cohortQuery}
        ${excludeBounceQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      ${filterQuery}
      group by session_id, visit_id
    ) as t;
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(result => result?.[0]);
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, buildParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const { excludeBounce } = filters;
  const bounceQuery = excludeBounce ? '0' : 'COALESCE(SUM(CASE WHEN t.c = 1 THEN 1 ELSE 0 END), 0)';

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      CAST(COALESCE(SUM(t.c), 0) AS SIGNED) AS pageviews,
      COUNT(DISTINCT t.session_id) AS visitors,
      COUNT(DISTINCT t.visit_id) AS visits,
      ${bounceQuery} AS bounces,
      CAST(COALESCE(SUM(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) AS SIGNED) AS totaltime
    FROM (
      SELECT
        website_event.session_id,
        website_event.visit_id,
        COUNT(*) AS c,
        MIN(website_event.created_at) AS min_time,
        MAX(website_event.created_at) AS max_time
      FROM website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
        AND website_event.created_at BETWEEN ? AND ?
        AND website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      GROUP BY 1, 2
    ) AS t
    `,
    params,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}
