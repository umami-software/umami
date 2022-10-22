import prisma from 'lib/prisma';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getPageviewParams(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, start_at, end_at, table, filters = {}) {
  const { parseFilters, rawQuery } = prisma;
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    filters,
    params,
  );

  return rawQuery(
    `select url x,
      count(*) y
    from ${table}
      ${joinSession}
    where ${table}.website_id=$1
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
