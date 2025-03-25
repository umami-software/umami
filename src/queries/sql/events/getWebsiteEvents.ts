import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, getDatabaseType, POSTGRESQL, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { PageParams, QueryFilters } from '@/lib/types';

export function getWebsiteEvents(
  ...args: [websiteId: string, filters: QueryFilters, pageParams?: PageParams]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search } = pageParams;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  return pagedRawQuery(
    `
    with events as (
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
    ${
      search
        ? `and ((event_name ${like} {{search}} and event_type = 2)
           or (url_path ${like} {{search}} and event_type = 1))`
        : ''
    }
    order by created_at desc
    limit 1000)
    select * from events
    `,
    { ...params, query: `%${search}%` },
    pageParams,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedQuery, parseFilters } = clickhouse;
  const { params, dateQuery, filterQuery } = await parseFilters(websiteId, filters);
  const { search } = pageParams;

  return pagedQuery(
    `
    with events as (
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
    ${
      search
        ? `and ((positionCaseInsensitive(event_name, {search:String}) > 0 and event_type = 2)
           or (positionCaseInsensitive(url_path, {search:String}) > 0 and event_type = 1))`
        : ''
    }
    order by created_at desc
    limit 1000)
    select * from events
    `,
    { ...params, search },
    pageParams,
  );
}
