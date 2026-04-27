import clickhouse from '@/lib/clickhouse';
import oceanbase from '@/lib/oceanbase';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getRevenueSessions';

export async function getRevenueSessions(
  ...args: [websiteId: string, currency: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, currency: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    currency,
    search: search ? `%${search}%` : undefined,
  });

  const searchQuery = search
    ? `and (session.browser ilike {{search}}
           or session.os ilike {{search}}
           or session.device ilike {{search}}
           or session.city ilike {{search}})`
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
    join session
      on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    join (
      select distinct session_id
      from revenue
      where website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
        and upper(currency) = {{currency}}
    ) rev on rev.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    group by
      session.session_id,
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

async function clickhouseQuery(websiteId: string, currency: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters, getDateStringSQL } = clickhouse;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    currency,
  });

  const searchQuery = search
    ? `and ((positionCaseInsensitive(browser, {search:String}) > 0)
           or (positionCaseInsensitive(city, {search:String}) > 0)
           or (positionCaseInsensitive(os, {search:String}) > 0)
           or (positionCaseInsensitive(device, {search:String}) > 0))`
    : '';

  return pagedRawQuery(
    `
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
      max(created_at) as createdAt
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
      and session_id in (
        select distinct session_id
        from website_revenue
        where website_id = {websiteId:UUID}
        ${dateQuery}
          and upper(currency) = {currency:String}
      )
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, region, city
    order by max(created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, currency: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = oceanbase;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, queryParams, buildParams, getDateParams } = parseFilters({
    ...filters,
    websiteId,
    currency,
    search: search ? `%${search}%` : undefined,
  });

  const searchQuery = search
    ? `AND (LOWER(session.browser) LIKE LOWER(?)
           OR LOWER(session.os) LIKE LOWER(?)
           OR LOWER(session.device) LIKE LOWER(?)
           OR LOWER(session.city) LIKE LOWER(?))`
    : '';

  const dateParams = getDateParams();

  // Build params: cohortQuery + subquery(websiteId,startDate,endDate,currency) + websiteId + dateQuery + filterQuery + searchQuery
  const params: any[] = [];

  // cohortQuery params (if present)
  if (cohortQuery) {
    params.push(websiteId, filters.startDate, filters.endDate);
  }

  // Subquery params: website_id, start_date, end_date, currency
  params.push(websiteId, filters.startDate, filters.endDate, currency);

  // Main query params: website_id + dateQuery + filterQuery
  params.push(websiteId, ...dateParams, ...queryParams);

  // searchQuery params (LIKE requires % wildcards)
  if (search) {
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

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
    JOIN session
      ON session.session_id = website_event.session_id
      AND session.website_id = website_event.website_id
    JOIN (
      SELECT DISTINCT session_id
      FROM revenue
      WHERE website_id = ?
        AND revenue.created_at BETWEEN ? AND ?
        AND UPPER(currency) = ?
    ) rev ON rev.session_id = website_event.session_id
    WHERE website_event.website_id = ?
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    GROUP BY
      session.session_id,
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
    params,
    filters,
    FUNCTION_NAME,
  );
}
