import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';
import { BOUNCE_THRESHOLD, EVENT_COLUMNS, EVENT_TYPE } from '@/lib/constants';

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
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, cohortQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 and t.events_count < ${BOUNCE_THRESHOLD} then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        sum(case when website_event.event_type = ${EVENT_TYPE.pageView} then 1 else 0 end) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time",
        max((
          select count(*)
          from website_event we2
          where we2.website_id = website_event.website_id
            and we2.session_id = website_event.session_id
            and we2.created_at between {{startDate}} and {{endDate}}
            and we2.event_type = ${EVENT_TYPE.customEvent}
        )) as "events_count"
      from website_event
        ${cohortQuery}
        ${joinSession}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
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
  const { filterQuery, cohortQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sumIf(1, t.c = 1 and ifNull(e.events_count, 0) < ${BOUNCE_THRESHOLD}) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        countIf(event_type = ${EVENT_TYPE.pageView}) as c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by session_id, visit_id
    ) as t
           left join (
      select session_id, toUInt32(count()) as events_count
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = ${EVENT_TYPE.customEvent}
      group by session_id
    ) as e using session_id;
    `;
  } else {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      sumIf(1, t.c = 1 and ifNull(e.events_count, 0) < ${BOUNCE_THRESHOLD}) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (select
            session_id,
            visit_id,
            sumIf(views, event_type = ${EVENT_TYPE.pageView}) as c,
            min(min_time) min_time,
            max(max_time) max_time
        from website_event_stats_hourly "website_event"
        ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
      group by session_id, visit_id
    ) as t
    left join (
      select session_id, toUInt32(sumIf(views, event_type = ${EVENT_TYPE.customEvent})) as events_count
      from website_event_stats_hourly
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      group by session_id
    ) as e using session_id;
    `;
  }

  return rawQuery(sql, params);
}
