import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

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
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
      count(distinct coalesce(t.resolved_identity, t.visitor_id, t.session_id::text)) as "visitors",
      count(distinct t.visit_id) as "visits",
      coalesce(sum(case when t.c = 1 then 1 else 0 end), 0) as "bounces",
      cast(coalesce(sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}), 0) as bigint) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        session.visitor_id,
        il.distinct_id as "resolved_identity",
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      left join session on session.session_id = website_event.session_id
        and session.website_id = website_event.website_id
      left join identity_link il on il.visitor_id = session.visitor_id
        and il.website_id = session.website_id
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type != 2
        ${filterQuery}
      group by 1, 2, 3, 4
    ) as t
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
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(coalesce(t.resolved_identity, t.visitor_id, toString(t.session_id))) as "visitors",
      uniq(t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        we.session_id,
        we.visit_id,
        we.visitor_id,
        il.distinct_id as resolved_identity,
        count(*) c,
        min(we.created_at) min_time,
        max(we.created_at) max_time
      from website_event we
      ${cohortQuery}
      left join identity_link final il on il.visitor_id = we.visitor_id
        and il.website_id = we.website_id
      where we.website_id = {websiteId:UUID}
        and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and we.event_type != 2
        ${filterQuery}
      group by we.session_id, we.visit_id, we.visitor_id, il.distinct_id
    ) as t;
    `;
  } else {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(coalesce(resolved_identity, visitor_id, toString(session_id))) as "visitors",
      uniq(visit_id) as "visits",
      sumIf(1, t.c = 1) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (select
            we.session_id,
            we.visit_id,
            we.visitor_id,
            il.distinct_id as resolved_identity,
            sum(we.views) c,
            min(we.min_time) min_time,
            max(we.max_time) max_time
        from website_event_stats_hourly we
        ${cohortQuery}
        left join identity_link final il on il.visitor_id = we.visitor_id
          and il.website_id = we.website_id
    where we.website_id = {websiteId:UUID}
      and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and we.event_type != 2
      ${filterQuery}
      group by we.session_id, we.visit_id, we.visitor_id, il.distinct_id
    ) as t;
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(result => result?.[0]);
}
