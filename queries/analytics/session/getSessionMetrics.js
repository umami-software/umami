import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getSessionMetrics(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, { startDate, endDate, field, filters = {} }) {
  const { parseFilters, rawQuery, toUuid } = prisma;
  const params = [websiteId, startDate, endDate];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(null, filters, params);

  return rawQuery(
    `select ${field} x, count(*) y
    from session as x
    where x.session_id in (
      select pageview.session_id
      from pageview
        join website 
          on pageview.website_id = website.website_id
        ${joinSession}
      where website.website_uuid = $1${toUuid()}
      and pageview.created_at between $2 and $3
      ${pageviewQuery}
      ${sessionQuery}
    )
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(websiteId, { startDate, endDate, field, filters = {} }) {
  const { parseFilters, getBetweenDates, rawQuery } = clickhouse;
  const params = [websiteId];
  const { pageviewQuery, sessionQuery } = parseFilters(null, filters, params);

  return rawQuery(
    `select ${field} x, count(*) y
    from event as x
    where website_id=$1
      and event_name = ''
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${pageviewQuery}
      ${sessionQuery}
    group by x
    order by y desc`,
    params,
  );
}
