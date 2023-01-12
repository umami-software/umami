import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { EVENT_TYPE } from 'lib/constants';

export async function getSessionMetrics(
  ...args: [
    websiteId: string,
    data: { startDate: Date; endDate: Date; field: string; filters: object },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; field: string; filters: object },
) {
  const { startDate, endDate, field, filters = {} } = data;
  const { toUuid, parseFilters, rawQuery } = prisma;
  const params: any = [websiteId, startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${field} x, count(*) y
    from session as x
    where x.session_id in (
      select website_event.session_id
      from website_event
        join website 
          on website_event.website_id = website.website_id
        ${joinSession}
      where website.website_id = $1${toUuid()}
      and website_event.created_at between $2 and $3
      ${filterQuery}
    )
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; field: string; filters: object },
) {
  const { startDate, endDate, field, filters = {} } = data;
  const { parseFilters, getBetweenDates, rawQuery } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = { websiteId, revId: website?.revId || 0 };
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${field} x, count(distinct session_id) y
    from event as x
    where website_id = {websiteId:UUID}
    and rev_id = {revId:UInt32}
    and event_type = ${EVENT_TYPE.pageView}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc`,
    params,
  );
}
