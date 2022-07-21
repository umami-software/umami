import { parseFilters, rawQuery } from 'lib/queries';

export function getSessionMetrics(website_id, start_at, end_at, field, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
  );

  return rawQuery(
    `
    select ${field} x, count(*) y
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
    order by 2 desc
    `,
    params,
  );
}
