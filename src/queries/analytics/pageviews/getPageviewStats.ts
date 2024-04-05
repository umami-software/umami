import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { EVENT_TYPE } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getPageviewStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { getDateQuery, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      ${getDateQuery('website_event.created_at', unit, timezone)} x,
      count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { parseFilters, rawQuery, getDateStringQuery, getDateQuery } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      ${getDateStringQuery('g.t', unit)} as x, 
      g.y as y
    from (
      select 
        ${getDateQuery('created_at', unit, timezone)} as t,
        count(*) as y
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by t
    ) as g
    order by t
    `,
    params,
  ).then(result => {
    return Object.values(result).map(a => {
      return { x: a.x, y: Number(a.y) };
    });
  });
}
