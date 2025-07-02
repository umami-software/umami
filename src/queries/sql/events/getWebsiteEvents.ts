import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export function getWebsiteEvents(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search } = filters;
  const { filterQuery, queryParams } = await parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = filters.search
    ? `and ((event_name ilike {{search}} and event_type = 2)
           or (url_path ilike {{search}} and event_type = 1))`
    : '';

  return pagedRawQuery(
    `
    select
      event_id as "id",
      website_id as "websiteId", 
      session_id as "sessionId",
      created_at as "createdAt",
      url_path as "urlPath",
      url_query as "urlQuery",
      referrer_path as "referrerPath",
      referrer_query as "referrerQuery",
      referrer_domain as "referrerDomain",
      page_title as "pageTitle",
      event_type as "eventType",
      event_name as "eventName"
    from website_event
    where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    ${searchQuery}
    order by created_at desc
    `,
    { ...queryParams, search: `%${search}%` },
    filters,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = clickhouse;
  const { queryParams, dateQuery, filterQuery } = await parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = filters.search
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
      url_path as urlPath,
      url_query as urlQuery,
      referrer_path as referrerPath,
      referrer_query as referrerQuery,
      referrer_domain as referrerDomain,
      page_title as pageTitle,
      event_type as eventType,
      event_name as eventName
    from website_event
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    order by created_at desc
    `,
    queryParams,
    filters,
  );
}
