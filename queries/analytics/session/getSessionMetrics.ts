import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';

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
  const { parseFilters, rawQuery } = prisma;
  const params = [startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${field} x, count(*) y
    from session as x
    where x.session_id in (
      select pageview.session_id
      from pageview
        join website 
          on pageview.website_id = website.website_id
        ${joinSession}
      where website.website_id='${websiteId}'
      and pageview.created_at between $1 and $2
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
  const params = [websiteId, website?.revId || 0];
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${field} x, count(*) y
    from event as x
    where website_id = $1
      and rev_id = $2
      and event_name = ''
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc`,
    params,
  );
}
