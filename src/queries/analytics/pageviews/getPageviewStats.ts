import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { EVENT_COLUMNS, EVENT_TYPE } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getPageviewStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { getDateSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} x,
      count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1
    order by 1
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { parseFilters, rawQuery, getDateSQL } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
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
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
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
        sum(views)as y
      from website_event_stats_hourly website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by t
    ) as g
    order by t
    `;
  }

  return rawQuery(sql, params);
}
