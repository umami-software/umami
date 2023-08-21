import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getSessionMetrics(
  ...args: [websiteId: string, column: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: SESSION_COLUMNS.includes(column),
    },
  );

  return rawQuery(
    `
    select ${column} x, count(*) y
    from website_event
    ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = {{eventType}}
    ${filterQuery}
    group by 1
    order by 2 desc
    limit 100`,
    params,
  );
}

async function clickhouseQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      ${column} x, count(distinct session_id) y
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x
    order by y desc
    limit 100
    `,
    params,
  );
}
