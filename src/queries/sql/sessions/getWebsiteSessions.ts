import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteSessions';

export async function getWebsiteSessions(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
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
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = search
    ? `and ((positionCaseInsensitive(distinct_id, {search:String}) > 0)
           or (positionCaseInsensitive(city, {search:String}) > 0)
           or (positionCaseInsensitive(browser, {search:String}) > 0)
           or (positionCaseInsensitive(os, {search:String}) > 0)
           or (positionCaseInsensitive(device, {search:String}) > 0))`
    : '';

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      session_id as id,
      website_id as websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL('min(created_at)')} as firstAt,
      ${getDateStringSQL('max(created_at)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(1, event_type = 1) as views,
      sumIf(1, event_type = 2) as events,
      lastAt as createdAt
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, region, city
    order by lastAt desc
    `;
  } else {
    sql = `
    select
      session_id as id,
      website_id as websiteId,
      arrayFirst(x -> 1, hostname) hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL('min(min_time)')} as firstAt,
      ${getDateStringSQL('max(max_time)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(views, event_type = 1) as views,
      sum(length(event_name)) as events,
      lastAt as createdAt
    from website_event_stats_hourly as website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, region, city
    order by lastAt desc
    `;
  }

  return pagedRawQuery(sql, queryParams, filters, FUNCTION_NAME);
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = oceanbase;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, buildParams, getDateParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  });

  // SQL order: cohortQuery, websiteId, dateQuery, filterQuery, searchQuery
  const params = buildParams([websiteId, ...getDateParams()]);

  // Add search params if needed (LIKE requires % wildcards)
  const searchParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [];

  const searchQuery = search
    ? `AND (LOWER(distinct_id) LIKE ?
           OR LOWER(city) LIKE ?
           OR LOWER(browser) LIKE ?
           OR LOWER(os) LIKE ?
           OR LOWER(device) LIKE ?)`
    : '';

  return pagedRawQuery(
    `
    SELECT
      session.session_id AS id,
      session.website_id AS websiteId,
      website_event.hostname,
      session.browser,
      session.os,
      session.device,
      session.screen,
      session.language,
      session.country,
      session.region,
      session.city,
      MIN(website_event.created_at) AS firstAt,
      MAX(website_event.created_at) AS lastAt,
      COUNT(DISTINCT website_event.visit_id) AS visits,
      SUM(CASE WHEN website_event.event_type = 1 THEN 1 ELSE 0 END) AS views,
      SUM(CASE WHEN website_event.event_type = 2 THEN 1 ELSE 0 END) AS events,
      MAX(website_event.created_at) AS createdAt
    FROM website_event
    ${cohortQuery}
    JOIN session ON session.session_id = website_event.session_id
      AND session.website_id = website_event.website_id
    WHERE website_event.website_id = ?
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    GROUP BY session.session_id,
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
    ORDER BY MAX(website_event.created_at) DESC
    `,
    [...params, ...searchParams],
    filters,
    FUNCTION_NAME,
  );
}
