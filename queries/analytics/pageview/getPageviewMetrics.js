import { parseFilters, rawQuery } from 'queries';

export function getPageviewMetrics(website_id, start_at, end_at, field, table, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, eventQuery, joinSession } = parseFilters(
    table,
    filters,
    params,
  );

  return rawQuery(
    `
    select ${field} x, count(*) y
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
