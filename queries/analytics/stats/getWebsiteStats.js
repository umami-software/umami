import { parseFilters, rawQuery, getDateQuery, getTimestampInterval } from 'lib/queries';

export function getWebsiteStats(website_id, start_at, end_at, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
  );

  return rawQuery(
    `
      select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then 1 else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
         select pageview.session_id,
           ${getDateQuery('pageview.created_at', 'hour')},
           count(*) c,
           ${getTimestampInterval('pageview.created_at')} as "time"
         from pageview
           ${joinSession}
         where pageview.website_id=$1
         and pageview.created_at between $2 and $3
         ${pageviewQuery}
         ${sessionQuery}
         group by 1, 2
     ) t
    `,
    params,
  );
}
