import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, EVENT_TYPE, FILTER_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteSessions';
const QUALIFIED_FILTER_COLUMNS = Object.fromEntries(
  Object.entries(FILTER_COLUMNS).map(([key, value]) => [key, `website_event.${value}`]),
);

export async function getWebsiteSessions(...args: [websiteId: string, filters: QueryFilters]) {
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
      sum(case when website_event.event_type = 1 then 1 else 0 end) as "views",
      sum(case when website_event.event_type = 2 then 1 else 0 end) as "events",
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
    order by max(website_event.created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
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
      sumIf(1, event_type = 1) as views,
      sumIf(1, event_type = 2) as events,
      max(created_at) as createdAt
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${normalizedFilterQuery}
    ${searchQuery}
    group by session_id
    order by lastAt desc
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
      sumIf(views, event_type = 1) as views,
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
    order by lastAt desc
    `;
  }

  return pagedRawQuery(sql, queryParams, filters, FUNCTION_NAME);
}
