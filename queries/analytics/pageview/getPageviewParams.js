import { getDatabase, parseFilters, rawQuery } from 'lib/db';
import { MYSQL, POSTGRESQL } from 'lib/constants';

export function getPageviewParams(
  param,
  website_id,
  start_at,
  end_at,
  column,
  table,
  filters = {},
) {
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
