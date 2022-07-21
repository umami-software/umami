import { parseFilters, rawQuery } from 'lib/queries';

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

  return rawQuery(
    `select * from (
        select
            url, split_part(split_part(url, concat($1, '='), 2), '&', 1) param
        from
            pageview
            ${joinSession}
            ${pageviewQuery}
            ${joinSession && sessionQuery}
            ${eventQuery}
        where
            ${table}.website_id=$2 and ${table}.created_at between $3 and $4
        group by 1, 2
        order by 2 desc
    ) q
    where q.param <> ''`,
    params,
  );
}
