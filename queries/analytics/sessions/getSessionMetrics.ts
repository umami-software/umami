import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { DEFAULT_RESET_DATE, EVENT_TYPE } from 'lib/constants';
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
    from session as x
    where x.session_id in (
      select website_event.session_id
      from website_event
        join website 
          on website_event.website_id = website.website_id
        ${joinSession}
      where website.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    )
    group by 1
    order by 2 desc
    limit 100`,
    { ...filters, websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
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
    from website_event as x
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
