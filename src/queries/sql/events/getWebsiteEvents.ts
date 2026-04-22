import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteEvents';

export function getWebsiteEvents(...args: [websiteId: string, filters: QueryFilters]) {
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
  });

  const searchQuery = search
    ? `and ((event_name ilike {{search}} and event_type = 2)
           or (url_path ilike {{search}} and event_type = 1))`
    : '';

  return pagedRawQuery(
    `
    select
      website_event.event_id as "id",
      website_event.website_id as "websiteId", 
      website_event.session_id as "sessionId",
      website_event.created_at as "createdAt",
      website_event.hostname,
      website_event.url_path as "urlPath",
      website_event.url_query as "urlQuery",
      website_event.referrer_path as "referrerPath",
      website_event.referrer_query as "referrerQuery",
      website_event.referrer_domain as "referrerDomain",
      session.country as country,
      city as city,
      device as  device,
      os as os,
      browser as browser,
      page_title as "pageTitle",
      website_event.event_type as "eventType",
      website_event.event_name as "eventName",
      event_id IN (select website_event_id 
                   from event_data
                   where website_id = {{websiteId::uuid}}
                      and created_at between {{startDate}} and {{endDate}}) AS "hasData"
    from website_event
    ${cohortQuery}
    join session on session.session_id = website_event.session_id 
      and session.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    order by website_event.created_at desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = clickhouse;
  const { search } = filters;
  const { queryParams, dateQuery, cohortQuery, filterQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = search
    ? `and ((positionCaseInsensitive(event_name, {search:String}) > 0 and event_type = 2)
           or (positionCaseInsensitive(url_path, {search:String}) > 0 and event_type = 1))`
    : '';

  return pagedRawQuery(
    `
    select
      event_id as id,
      website_id as websiteId,
      session_id as sessionId,
      created_at as createdAt,
      hostname,
      url_path as urlPath,
      url_query as urlQuery,
      referrer_path as referrerPath,
      referrer_query as referrerQuery,
      referrer_domain as referrerDomain,
      country as country,
      city as city,
      device as device,
      os as os,
      browser as browser,
      page_title as pageTitle,
      event_type as eventType,
      event_name as eventName,
      event_id IN (select event_id
                   from event_data
                   where website_id = {websiteId:UUID}
                   ${dateQuery}) as hasData
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    order by created_at desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = oceanbase;
  const { search } = filters;
  const { filterQuery, dateQuery, cohortQuery, buildParams, getDateParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  });

  // SQL order: cohortQuery, subquery(websiteId,startDate,endDate), websiteId, dateQuery, filterQuery, searchQuery
  const params = buildParams([websiteId, filters.startDate, filters.endDate, websiteId, ...getDateParams()]);

  // Add search params if needed
  const searchParams = search ? [search, search] : [];

  const searchQuery = search
    ? `AND ((LOWER(event_name) LIKE ? AND event_type = 2)
           OR (LOWER(url_path) LIKE ? AND event_type = 1))`
    : '';

  return pagedRawQuery(
    `
    SELECT
      website_event.event_id AS id,
      website_event.website_id AS websiteId,
      website_event.session_id AS sessionId,
      website_event.created_at AS createdAt,
      website_event.hostname,
      website_event.url_path AS urlPath,
      website_event.url_query AS urlQuery,
      website_event.referrer_path AS referrerPath,
      website_event.referrer_query AS referrerQuery,
      website_event.referrer_domain AS referrerDomain,
      session.country AS country,
      city AS city,
      device AS device,
      os AS os,
      browser AS browser,
      page_title AS pageTitle,
      website_event.event_type AS eventType,
      website_event.event_name AS eventName,
      event_id IN (SELECT website_event_id
                   FROM event_data
                   WHERE website_id = ?
                      AND created_at BETWEEN ? AND ?) AS hasData
    FROM website_event
    ${cohortQuery}
    JOIN session ON session.session_id = website_event.session_id
      AND session.website_id = website_event.website_id
    WHERE website_event.website_id = ?
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    ORDER BY website_event.created_at DESC
    `,
    [...params, ...searchParams],
    filters,
    FUNCTION_NAME,
  );
}
