import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import clickhouse from 'lib/clickhouse';
import { parseFilters, rawQuery } from 'lib/relational';
import { runAnalyticsQuery } from 'lib/db/db';

export async function getPageviewMetrics(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, start_at, end_at, column, table, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    column,
    filters,
    params,
  );

  return rawQuery(
    `
    select ${column} x, count(*) y
    from ${table}
      ${joinSession}
    where ${table}.website_id=$1
      and ${table}.created_at between $2 and $3
      ${pageviewQuery}
      ${joinSession && sessionQuery}
      ${eventQuery}
    group by 1
    order by 2 desc
    `,
    params,
  );
}

async function clickhouseQuery(website_id, start_at, end_at, column, table, filters = {}) {
  const params = [website_id];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = clickhouse.parseFilters(
    table,
    column,
    filters,
    params,
    'session_uuid',
  );

  return clickhouse.rawQuery(
    `
    select ${column} x, count(*) y
    from ${table}
      ${joinSession}
    where ${table}.website_id= $1
    and ${clickhouse.getBetweenDates(table + '.created_at', start_at, end_at)}
    ${pageviewQuery}
    ${joinSession && sessionQuery}
    ${eventQuery}
    group by x
    order by y desc
    `,
    params,
  );
}
