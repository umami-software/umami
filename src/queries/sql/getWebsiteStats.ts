import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteStats';

export interface WebsiteStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getWebsiteStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const { excludeBounce } = filters;
  const hasEventFilters =
    EVENT_COLUMNS.some(item => Object.keys(filters).includes(item)) ||
    !!filters.eventPropertyFilters?.length;

  if (!hasEventFilters) {
    return rawQuery(
      `
      select
        cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
        count(distinct t.session_id) as "visitors",
        count(distinct t.visit_id) as "visits",
        ${excludeBounce ? '0' : 'coalesce(sum(case when t.c = 1 and t.has_custom_event = 0 then 1 else 0 end), 0)'} as "bounces",
        cast(coalesce(sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) as bigint) as "totaltime"
      from (
        select
          website_event.session_id,
          website_event.visit_id,
          sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) as "c",
          min(case when website_event.event_type NOT IN (2, 5) then website_event.created_at end) as "min_time",
          max(case when website_event.event_type NOT IN (2, 5) then website_event.created_at end) as "max_time",
          max(case when website_event.event_type = ${EVENT_TYPE.customEvent} then 1 else 0 end) as "has_custom_event"
        from website_event
        ${cohortQuery}
        ${excludeBounceQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.created_at between {{startDate}} and {{endDate}}
          and website_event.event_type != ${EVENT_TYPE.performance}
          ${filterQuery}
        group by 1, 2
        having sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) > 0
      ) as t
      `,
      queryParams,
      FUNCTION_NAME,
    ).then(result => result?.[0]);
  }

  const bounceQuery = excludeBounce
    ? '0'
    : 'coalesce(sum(case when t.c = 1 and coalesce(e.has_custom_event, 0) = 0 then 1 else 0 end), 0)';
  const visitEventsJoin = excludeBounce
    ? ''
    : `
      left join (
        select session_id, visit_id, 1 as "has_custom_event"
        from website_event
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          and event_type = ${EVENT_TYPE.customEvent}
        group by 1, 2
      ) as e
        on e.session_id = t.session_id
        and e.visit_id = t.visit_id`;

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
      cast(coalesce(sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) as bigint) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by 1, 2
    ) as t
    ${visitEventsJoin}
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';
  const { excludeBounce } = filters;
  const hasEventFilters =
    EVENT_COLUMNS.some(item => Object.keys(filters).includes(item)) ||
    !!filters.eventPropertyFilters?.length;
  const bounceQuery = excludeBounce
    ? '0'
    : 'sumIf(1, t.c = 1 and t.has_custom_event = 0)';

  if (hasEventFilters) {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      ${excludeBounce ? '0' : 'sumIf(1, t.c = 1 and ifNull(e.has_custom_event, 0) = 0)'} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        ${filterQuery}
      group by session_id, visit_id
    ) as t
    ${excludeBounce ? '' : `left join (
      select session_id, visit_id, toUInt8(1) as has_custom_event
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = ${EVENT_TYPE.customEvent}
      group by session_id, visit_id
    ) as e using (session_id, visit_id)`};
    `;
  } else {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      ${bounceQuery} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        sum(views) c,
        minIf(min_time, event_type NOT IN (2, 5)) min_time,
        maxIf(max_time, event_type NOT IN (2, 5)) max_time,
        max(if(event_type = ${EVENT_TYPE.customEvent} and length(event_name) > 0, 1, 0)) has_custom_event
        from website_event_stats_hourly "website_event"
        ${cohortQuery}
        ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != ${EVENT_TYPE.performance}
        ${filterQuery}
      group by session_id, visit_id
      having c > 0
    ) as t
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(result => result?.[0]);
}
