import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, EVENT_TYPE, FILTER_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { getRollupRange, getRollupWatermark, logRollupError } from '@/lib/rollups';
import type { PageResult, QueryFilters, WebsiteSession } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteSessions';
const QUALIFIED_FILTER_COLUMNS = Object.fromEntries(
  Object.entries(FILTER_COLUMNS).map(([key, value]) => [key, `website_event.${value}`]),
);

export async function getWebsiteSessions(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<PageResult<WebsiteSession[]>> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  });

  const searchQuery = search
    ? `and (distinct_id ilike {{search}}
           or city ilike {{search}}
           or browser ilike {{search}}
           or os ilike {{search}}
           or device ilike {{search}})`
    : '';

  // Opt-in rollup path (ROLLUPS_ENABLED): per-session aggregates from the
  // visit-grain tier plus the raw tail past the watermark, joined to the
  // session table only for the final rows. Identical numbers to the raw
  // path, with one documented nuance: null and '' hostnames merge.
  if (!filterQuery && !cohortQuery && !search) {
    const watermark = await getRollupWatermark();
    const range = watermark && getRollupRange(filters.startDate, filters.endDate, watermark);

    if (range) {
      // Watermark freshness does not guarantee the rollup tables are intact
      // (e.g. dropped or being rebuilt); fall back to the raw path on error.
      try {
        return await pagedRawQuery(
          `
          with g as (
            select session_id, visit_id, hostname, views, event_views, all_min_time, all_max_time
            from website_visit_rollup_hourly
            where website_id = {{websiteId::uuid}}
              and bucket >= {{hstart}}
              and bucket < {{hend}}
            union all
            select session_id, visit_id, coalesce(hostname, ''),
              count(*) filter (where event_type = 1),
              count(*) filter (where event_type = 2),
              min(created_at),
              max(created_at)
            from website_event
            where website_id = {{websiteId::uuid}}
              and ((created_at >= {{startDate}} and created_at < {{hstart}})
                or (created_at >= {{hend}} and created_at <= {{endDate}}))
              and event_type != ${EVENT_TYPE.performance}
            group by 1, 2, 3
          )
          select
            session.session_id as "id",
            session.website_id as "websiteId",
            nullif(s.hostname, '') as hostname,
            session.browser,
            session.os,
            session.device,
            session.screen,
            session.language,
            session.country,
            session.region,
            session.city,
            s.first_at as "firstAt",
            s.last_at as "lastAt",
            s.visits,
            s.views,
            s.events,
            s.last_at as "createdAt"
          from (
            select
              session_id,
              hostname,
              min(all_min_time) as first_at,
              max(all_max_time) as last_at,
              count(distinct visit_id) as visits,
              cast(sum(views) as bigint) as views,
              cast(sum(event_views) as bigint) as events
            from g
            group by 1, 2
          ) s
          join session on session.session_id = s.session_id
            and session.website_id = {{websiteId::uuid}}
          `,
          { ...queryParams, hstart: range.hstart, hend: range.hend },
          filters,
          FUNCTION_NAME,
          's.last_at desc, session.session_id',
        );
      } catch (e) {
        logRollupError(e);
      }
    }
  }

  return pagedRawQuery(
    `
    select
      session.session_id as "id",
      session.website_id as "websiteId",
      website_event.hostname,
      session.browser,
      session.os,
      session.device,
      session.screen,
      session.language,
      session.country,
      session.region,
      session.city,
      min(website_event.created_at) as "firstAt",
      max(website_event.created_at) as "lastAt",
      count(distinct website_event.visit_id) as "visits",
      sum(case when website_event.event_type = ${EVENT_TYPE.pageView} then 1 else 0 end) as "views",
      sum(case when website_event.event_type = ${EVENT_TYPE.customEvent} then 1 else 0 end) as "events",
      max(website_event.created_at) as "createdAt"
    from website_event 
    ${cohortQuery}
    join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    group by session.session_id, 
      session.website_id, 
      website_event.hostname, 
      session.browser, 
      session.os, 
      session.device, 
      session.screen, 
      session.language, 
      session.country, 
      session.region, 
      session.city
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
    'max(website_event.created_at) desc, session.session_id',
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters, getDateStringSQL } = clickhouse;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
    },
    {
      columns: QUALIFIED_FILTER_COLUMNS,
    },
  );

  const searchQuery = search
    ? `and ((positionCaseInsensitive(website_event.distinct_id, {search:String}) > 0)
           or (positionCaseInsensitive(website_event.city, {search:String}) > 0)
           or (positionCaseInsensitive(website_event.browser, {search:String}) > 0)
           or (positionCaseInsensitive(website_event.os, {search:String}) > 0)
           or (positionCaseInsensitive(website_event.device, {search:String}) > 0))`
    : '';
  const normalizedFilterQuery = filterQuery.replace(
    /referrer_domain != hostname/g,
    'website_event.referrer_domain != website_event.hostname',
  );

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      session_id as id,
      any(website_id) as websiteId,
      argMax(hostname, created_at) as hostname,
      argMax(browser, created_at) as browser,
      argMax(os, created_at) as os,
      argMax(device, created_at) as device,
      argMax(screen, created_at) as screen,
      argMax(language, created_at) as language,
      argMax(country, created_at) as country,
      argMax(region, created_at) as region,
      argMax(city, created_at) as city,
      ${getDateStringSQL('min(created_at)')} as firstAt,
      ${getDateStringSQL('max(created_at)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(1, event_type = ${EVENT_TYPE.pageView}) as views,
      sumIf(1, event_type = ${EVENT_TYPE.customEvent}) as events,
      max(created_at) as createdAt
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${normalizedFilterQuery}
    ${searchQuery}
    group by session_id
    order by lastAt desc, id
    `;
  } else {
    sql = `
    select
      session_id as id,
      any(website_id) as websiteId,
      argMax(arrayFirst(x -> 1, hostname), max_time) as hostname,
      argMax(browser, max_time) as browser,
      argMax(os, max_time) as os,
      argMax(device, max_time) as device,
      argMax(screen, max_time) as screen,
      argMax(language, max_time) as language,
      argMax(country, max_time) as country,
      argMax(region, max_time) as region,
      argMax(city, max_time) as city,
      ${getDateStringSQL('min(min_time)')} as firstAt,
      ${getDateStringSQL('max(max_time)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(views, event_type = ${EVENT_TYPE.pageView}) as views,
      sum(length(event_name)) as events,
      max(max_time) as createdAt
    from website_event_stats_hourly as website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${normalizedFilterQuery}
    ${searchQuery}
    group by session_id
    order by lastAt desc, id
    `;
  }

  return pagedRawQuery(sql, queryParams, filters, FUNCTION_NAME);
}
