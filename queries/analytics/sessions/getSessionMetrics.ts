import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export async function getSessionMetrics(
  ...args: [
    websiteId: string,
    criteria: { startDate: Date; endDate: Date; column: string; filters: object },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: { startDate: Date; endDate: Date; column: string; filters: object },
) {
  const website = await loadWebsite(websiteId);
  const { startDate, endDate, column, filters = {} } = criteria;
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession } = parseFilters(filters);

  return rawQuery(
    `select ${column} x, count(*) y
      from website_event
      ${joinSession}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    ) as t
    group by 1
    order by 2 desc
    limit 100`,
    {
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      ...filters,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; column: string; filters: object },
) {
  const { startDate, endDate, column, filters = {} } = data;
  const { parseFilters, rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const { filterQuery } = parseFilters(filters);

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
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.pageView,
    },
  );
}
