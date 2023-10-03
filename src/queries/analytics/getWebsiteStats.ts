import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getWebsiteStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { getDateQuery, getTimestampIntervalQuery, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "uniques",
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(t.time) as "totaltime"
    from (
      select
        website_event.session_id,
        ${getDateQuery('website_event.created_at', 'hour')},
        count(*) as c,
        ${getTimestampIntervalQuery('website_event.created_at')} as "time"
      from website_event
      join website 
        on website_event.website_id = website.website_id
        ${joinSession}
      where website.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and event_type = {{eventType}}
        ${filterQuery}
      group by 1, 2
    ) as t
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ pageviews: number; uniques: number; bounces: number; totaltime: number }[]> {
  const { rawQuery, getDateQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select 
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "uniques",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(if(max_time < min_time + interval 1 hour, max_time-min_time, 0)) as "totaltime"
    from (
      select
        session_id,
        ${getDateQuery('created_at', 'day')} time_series,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by session_id, time_series
    ) as t;
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return {
        pageviews: Number(a.pageviews),
        uniques: Number(a.uniques),
        bounces: Number(a.bounces),
        totaltime: Number(a.totaltime),
      };
    });
  });
}
