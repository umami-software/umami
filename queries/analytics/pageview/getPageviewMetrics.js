import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getPageviewMetrics(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, { startDate, endDate, column, table, filters = {} }) {
  const { rawQuery, parseFilters } = prisma;
  const params = [website_id, startDate, endDate];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    column,
    filters,
    params,
  );

  return rawQuery(
    `select ${column} x, count(*) y
    from ${table}
      ${joinSession}
    where ${table}.website_id=$1
      and ${table}.created_at between $2 and $3
      ${pageviewQuery}
      ${joinSession && sessionQuery}
      ${eventQuery}
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(website_id, { startDate, endDate, column, filters = {} }) {
  const { rawQuery, parseFilters, getBetweenDates } = clickhouse;
  const params = [website_id];
  const { pageviewQuery, sessionQuery, eventQuery } = parseFilters(column, filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from event
    where website_id= $1
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
