import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getSessionMetrics(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, start_at, end_at, field, filters = {}) {
  const { parseFilters, rawQuery } = prisma;
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
  );

  return rawQuery(
    `select ${field} x, count(*) y
    from session as x
    where x.session_id in (
      select pageview.session_id
      from pageview
        ${joinSession}
      where pageview.website_id=$1
      and pageview.created_at between $2 and $3
      ${pageviewQuery}
      ${sessionQuery}
    )
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(website_id, start_at, end_at, field, filters = {}) {
  const { parseFilters, getBetweenDates, rawQuery } = clickhouse;
  const params = [website_id];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
    'session_uuid',
  );

  return rawQuery(
    `select ${field} x, count(*) y
    from session as x
    where x.session_uuid in (
      select pageview.session_uuid
      from pageview
        ${joinSession}
      where pageview.website_id=$1
      and ${getBetweenDates('pageview.created_at', start_at, end_at)}
      ${pageviewQuery}
      ${sessionQuery}
    )
    group by x
    order by y desc`,
    params,
  );
}
