import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { WebsiteEventMetric, QueryFilters } from 'lib/types';
import { EVENT_TYPE } from 'lib/constants';

export async function getEventMetrics(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateQuery, parseFilters } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `
    select
      event_name x,
      ${getDateQuery('website_event.created_at', unit, timezone)} t,
      count(*) y
    from website_event
    ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1, 2
    order by 2
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; t: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `
    select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x, t
    order by t
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return { x: a.x, t: a.t, y: Number(a.y) };
    });
  });
}
