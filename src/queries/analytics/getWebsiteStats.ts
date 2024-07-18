import clickhouse from 'lib/clickhouse';
import { EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { QueryFilters } from 'lib/types';

export async function getWebsiteStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<
  { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }[]
> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }[]
> {
  const { getTimestampDiffQuery, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffQuery('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
        ${joinSession}
      where website_event.website_id = {{websiteId::uuid}}
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
): Promise<
  { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }[]
> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select 
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by session_id, visit_id
    ) as t;
    `,
    params,
  ).then(result => {
    return Object.values(result).map((a: any) => {
      return {
        pageviews: Number(a.pageviews),
        visitors: Number(a.visitors),
        visits: Number(a.visits),
        bounces: Number(a.bounces),
        totaltime: Number(a.totaltime),
      };
    });
  });
}
