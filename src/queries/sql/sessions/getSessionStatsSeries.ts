import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionStatsSeries';

export interface SessionStatsSeriesRow {
  x: string;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getSessionStatsSeries(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<SessionStatsSeriesRow[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<SessionStatsSeriesRow[]> {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const { excludeBounce } = filters;
  const bounceExpr = excludeBounce ? '0' : 'sum(case when t.c = 1 then 1 else 0 end)';

  return rawQuery(
    `
    select
      ${getDateSQL('t.min_time', unit, timezone)} as x,
      count(distinct t.visit_id) as visits,
      coalesce(${bounceExpr}, 0) as bounces,
      coalesce(sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) as totaltime
    from (
      select
        website_event.visit_id,
        count(*) as c,
        min(website_event.created_at) as min_time,
        max(website_event.created_at) as max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by 1
    ) as t
    group by 1
    order by 1
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<SessionStatsSeriesRow[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { parseFilters, rawQuery, getDateSQL } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const { excludeBounce } = filters;
  const bounceExpr = excludeBounce ? '0' : 'sumIf(1, t.c = 1)';

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item)) || unit === 'minute') {
    sql = `
    select
      ${getDateSQL('t.min_time', unit, timezone)} as x,
      uniq(t.visit_id) as visits,
      ${bounceExpr} as bounces,
      sum(t.max_time - t.min_time) as totaltime
    from (
      select
        visit_id,
        count(*) as c,
        min(created_at) as min_time,
        max(created_at) as max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        ${filterQuery}
      group by visit_id
    ) as t
    group by x
    order by x
    `;
  } else {
    sql = `
    select
      ${getDateSQL('t.min_time', unit, timezone)} as x,
      uniq(t.visit_id) as visits,
      ${bounceExpr} as bounces,
      sum(t.max_time - t.min_time) as totaltime
    from (
      select
        visit_id,
        sum(views) as c,
        min(min_time) as min_time,
        max(max_time) as max_time
      from website_event_stats_hourly as website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        ${filterQuery}
      group by visit_id
    ) as t
    group by x
    order by x
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}
