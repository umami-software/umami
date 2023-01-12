import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { EVENT_TYPE } from 'lib/constants';

export async function getWebsiteStats(
  ...args: [websiteId: string, data: { startDate: Date; endDate: Date; filters: object }]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; filters: object },
) {
  const { startDate, endDate, filters = {} } = data;
  const { toUuid, getDateQuery, getTimestampInterval, parseFilters, rawQuery } = prisma;
  const params: any = [websiteId, startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then 1 else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
        select website_event.session_id,
          ${getDateQuery('website_event.created_at', 'hour')},
          count(*) c,
          ${getTimestampInterval('website_event.created_at')} as "time"
        from website_event
          join website 
            on website_event.website_id = website.website_id
          ${joinSession}
        where website.website_id = $1${toUuid()}
          and website_event.created_at between $2 and $3
          ${filterQuery}
        group by 1, 2
     ) t`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; filters: object },
) {
  const { startDate, endDate, filters = {} } = data;
  const { rawQuery, getDateQuery, getBetweenDates, parseFilters } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = { websiteId, revId: website?.revId || 0 };
  const { filterQuery } = parseFilters(filters, params);

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
       where event_type = ${EVENT_TYPE.pageView}
        and website_id = {websiteId:UUID}
        and rev_id = {revId:UInt32}
         and ${getBetweenDates('created_at', startDate, endDate)}
         ${filterQuery}
       group by session_id, time_series
     ) t;`,
    params,
  );
}
