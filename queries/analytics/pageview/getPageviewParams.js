import prisma from 'lib/prisma';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getPageviewParams(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, start_at, end_at, column, table, filters = {}) {
  const { parseFilters, rawQuery, toUuid } = prisma;
  const params = [websiteId, start_at, end_at];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    column,
    filters,
    params,
  );

  return rawQuery(
    `select url x,
      count(*) y
    from ${table}
      ${` join website on ${table}.website_id = website.website_id`}
      ${joinSession}
    where website.website_uuid = $1${toUuid()}
      and ${table}.created_at between $2 and $3
      and ${table}.url like '%?%'
      ${pageviewQuery}
      ${joinSession && sessionQuery}
      ${eventQuery}
    group by 1
    order by 2 desc`,
    params,
  );
}

function clickhouseQuery() {
  return Promise.reject(new Error('Not implemented.'));
}
