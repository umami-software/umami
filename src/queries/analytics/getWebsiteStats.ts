/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import clickhouse from 'lib/clickhouse';
import { EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { QueryFilters } from 'lib/types';

export async function getWebsiteStats(
  ...args: [websiteId: string, unit: string, filters: QueryFilters]
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
  unit: string,
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
  unit: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }[]
> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });
  const table = unit === 'hour' ? 'website_event_stats_hourly' : 'website_event_stats_daily';

  return rawQuery(
    `
    select 
      sum(views) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      sumIf(1, views = 1) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from ${table} "website_event"
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${filterQuery};
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
