import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getWebsiteStats(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, { start_at, end_at, filters = {} }) {
  const { getDateQuery, getTimestampInterval, parseFilters, rawQuery } = prisma;
  const params = [start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
  );

  return rawQuery(
    `select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then 1 else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
        select pageview.session_id,
          ${getDateQuery('pageview.created_at', 'hour')},
          count(*) c,
          ${getTimestampInterval('pageview.created_at')} as "time"
        from pageview
          join website 
            on pageview.website_id = website.website_id
          ${joinSession}
        where website.website_uuid='${websiteId}'
          and pageview.created_at between $1 and $2
          ${pageviewQuery}
          ${sessionQuery}
        group by 1, 2
     ) t`,
    params,
  );
}

async function clickhouseQuery(websiteId, { start_at, end_at, filters = {} }) {
  const { rawQuery, getDateQuery, getBetweenDates, parseFilters } = clickhouse;
  const params = [websiteId];
  const { pageviewQuery, sessionQuery } = parseFilters(null, filters, params);

  return rawQuery(
    `select 
       sum(t.c) as "pageviews",
       count(distinct t.session_id) as "uniques",
       sum(if(t.c = 1, 1, 0)) as "bounces",
       sum(if(max_time < min_time + interval 1 hour, max_time-min_time, 0)) as "totaltime"
     from (
       select session_id,
         ${getDateQuery('created_at', 'day')} time_series,
         count(*) c,
         min(created_at) min_time,
         max(created_at) max_time
       from event
       where event_name = ''
         and website_id = $1
         and ${getBetweenDates('created_at', start_at, end_at)}
         ${pageviewQuery}
         ${sessionQuery}
       group by session_id, time_series
     ) t;`,
    params,
  );
}
