import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import {
  getDateQuery,
  getBetweenDatesClickhouse,
  getDateQueryClickhouse,
  getTimestampInterval,
  parseFilters,
  rawQuery,
  rawQueryClickhouse,
  runAnalyticsQuery,
} from 'lib/db';

export async function getWebsiteStats(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, start_at, end_at, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters('pageview', filters, params);

  return rawQuery(
    `
      select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then 1 else 0 end) as "bounces",
        sum(case when m2 < m1 + interval '1 hour' then ${getTimestampInterval(
          'm2',
          'm1',
        )} else 0 end) as "totaltime"
        sum(t.time) as "totaltime"
      from (
        select 
          pageview.session_id,
          ${getDateQuery('pageview.created_at', 'hour')},
          count(*) c,
          min(created_at) m1,
          max(created_at) m2
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

async function clickhouseQuery(website_id, start_at, end_at, filters = {}) {
  const params = [website_id];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters('pageview', filters, params);

  return rawQueryClickhouse(
    `
      select 
        sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(if(t.c = 1, 1, 0)) as "bounces",
        sum(if(max_time < min_time + interval 1 hour, max_time-min_time, 0)) as "totaltime"
      from (
        select pageview.session_id,
          ${getDateQueryClickhouse('pageview.created_at', 'day')} time_series,
          count(*) c,
          min(created_at) min_time,
          max(created_at) max_time
        from pageview
          ${joinSession}
        where pageview.website_id = $1
          and ${getBetweenDatesClickhouse('pageview.created_at', start_at, end_at)}
          ${pageviewQuery}
          ${sessionQuery}
        group by pageview.session_id, time_series
      ) t;
    `,
    params,
  );
}
