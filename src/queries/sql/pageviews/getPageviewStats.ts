import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getPageviewStats';

export async function getPageviewStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { getDateSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} x,
      count(*) y
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}  
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type != 2
      ${filterQuery}
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
): Promise<{ x: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { parseFilters, rawQuery, getDateSQL } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item)) || unit === 'minute') {
    sql = `
    select
      g.t as x,
      g.y as y
    from (
      select
        ${getDateSQL('website_event.created_at', unit, timezone)} as t,
        count(*) as y
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != 2
        ${filterQuery}
      group by t
    ) as g
    order by t
    `;
  } else {
    sql = `
    select
      g.t as x,
      g.y as y
    from (
      select
        ${getDateSQL('website_event.created_at', unit, timezone)} as t,
        sum(views) as y
      from website_event_stats_hourly as website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != 2
        ${filterQuery}
      group by t
    ) as g
    order by t
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}
