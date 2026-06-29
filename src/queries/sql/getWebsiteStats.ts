import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
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
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const { excludeBounce } = filters;
  const bounceQuery = excludeBounce ? '0' : 'coalesce(sum(case when t.c = 1 then 1 else 0 end), 0)';

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "pageviews",
      count(distinct coalesce(t.resolved_identity, t.visitor_id, t.session_id::text)) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
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
      ${excludeBounceQuery}
      left join session on session.session_id = website_event.session_id
        and session.website_id = website_event.website_id
      left join (
        select distinct on (website_id, visitor_id) website_id, visitor_id, distinct_id
        from identity_link
        order by website_id, visitor_id, linked_at asc, distinct_id asc
      ) il on il.visitor_id = session.visitor_id
        and il.website_id = session.website_id
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
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
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';
  const { excludeBounce } = filters;
  const bounceQuery = excludeBounce ? '0' : 'sumIf(1, t.c = 1)';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(coalesce(nullIf(t.resolved_identity, ''), nullIf(t.visitor_id, ''), toString(t.session_id))) as "visitors",
      uniq(t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        website_event.visitor_id,
        il.distinct_id as resolved_identity,
        count(*) c,
        min(website_event.created_at) min_time,
        max(website_event.created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      left join (
        select website_id, visitor_id, argMin(distinct_id, linked_at) as distinct_id
        from identity_link final
        group by website_id, visitor_id
      ) il on il.visitor_id = website_event.visitor_id
        and il.website_id = website_event.website_id
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by website_event.session_id, website_event.visit_id, website_event.visitor_id, il.distinct_id
    ) as t;
    `;
  } else {
    sql = `
    select
      sum(t.c) as "pageviews",
      uniq(coalesce(nullIf(t.resolved_identity, ''), nullIf(t.visitor_id, ''), toString(t.session_id))) as "visitors",
      uniq(t.visit_id) as "visits",
      ${bounceQuery} as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (select
            "website_event".session_id,
            "website_event".visit_id,
            "website_event".visitor_id,
            il.distinct_id as resolved_identity,
            sum("website_event".views) c,
            min("website_event".min_time) min_time,
            max("website_event".max_time) max_time
        from website_event_stats_hourly "website_event"
        ${cohortQuery}
        ${excludeBounceQuery}
        left join (
          select website_id, visitor_id, argMin(distinct_id, linked_at) as distinct_id
          from identity_link final
          group by website_id, visitor_id
        ) il on il.visitor_id = "website_event".visitor_id
          and il.website_id = "website_event".website_id
    where "website_event".website_id = {websiteId:UUID}
      and "website_event".created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and "website_event".event_type NOT IN (2, 5)
      ${filterQuery}
      group by "website_event".session_id, "website_event".visit_id, "website_event".visitor_id, il.distinct_id
    ) as t;
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(result => result?.[0]);
}
