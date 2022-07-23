import { getDatabase, parseFilters, rawQuery, runAnalyticsQuery } from 'lib/db';
import { MYSQL, POSTGRESQL, CLICKHOUSE, RELATIONAL } from 'lib/constants';

export async function getPageviewParams(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(param, website_id, start_at, end_at, column, table, filters = {}) {
  const params = [param, website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    column,
    filters,
    params,
  );

  let splitFn;
  let db = getDatabase();
  if (db === MYSQL) splitFn = 'substring_index';
  if (db === POSTGRESQL) splitFn = 'split_part';
  if (!splitFn) return Promise.reject(new Error('Unknown database.'));

  return rawQuery(
    `select * from (
      select
        url, ${splitFn}(${splitFn}(url, concat($1, '='), 2), '&', 1) param
      from
        pageview
        ${joinSession}
      where
        ${table}.website_id=$2 and ${table}.created_at between $3 and $4
        ${pageviewQuery}
        ${joinSession && sessionQuery}
        ${eventQuery}
      group by 1, 2
      order by 2 desc
    ) q
    where q.param <> ''`,
    params,
  );
}

function clickhouseQuery() {
  return Promise.reject(new Error('Not implemented.'));
}
