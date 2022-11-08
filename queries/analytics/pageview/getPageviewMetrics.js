import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';

export async function getPageviewMetrics(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, { startDate, endDate, column, table, filters = {} }) {
  const { rawQuery, parseFilters } = prisma;
  const params = [startDate, endDate];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    column,
    filters,
    params,
  );

  return rawQuery(
    `select ${column} x, count(*) y
    from ${table}
      ${` join website on ${table}.website_id = website.website_id`}
      ${joinSession}
    where website.website_id='${websiteId}'
      and ${table}.created_at between $1 and $2
      ${pageviewQuery}
      ${joinSession && sessionQuery}
      ${eventQuery}
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(websiteId, { startDate, endDate, column, filters = {} }) {
  const { rawQuery, parseFilters, getBetweenDates } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = [websiteId, website?.revId || 0];
  const { pageviewQuery, sessionQuery, eventQuery } = parseFilters(column, filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from event
    where website_id = $1
      and rev_id = $2
      ${column !== 'event_name' ? `and event_name = ''` : `and event_name != ''`}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${pageviewQuery}
      ${sessionQuery}
      ${eventQuery}
    group by x
    order by y desc`,
    params,
  );
}
