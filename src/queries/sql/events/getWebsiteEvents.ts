import clickhouse from '@/lib/clickhouse';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteEvents';

export function getWebsiteEvents(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { search, page = 1, pageSize, maxResults, orderBy } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);
  const { filterQuery, dateQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const hasDataDateQuery = dateQuery.replaceAll('website_event.', 'event_data.');

  const searchQuery = search
    ? `and ((event_name ilike {{search}} and event_type = ${EVENT_TYPE.customEvent})
           or (url_path ilike {{search}} and event_type = ${EVENT_TYPE.pageView}))`
    : '';

  const eventQuery = `
    select
      website_event.event_id,
      website_event.created_at
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
  `;

  const countQuery = maxResults
    ? `select count(*) as num from (select 1 from (${eventQuery}) t limit ${+maxResults}) t2`
    : `select count(*) as num from (${eventQuery}) t`;

  const count = await rawQuery(countQuery, queryParams).then(res => Number(res[0].num));

  const data = await rawQuery(
    `
    with paged_events as (
      ${eventQuery}
      order by created_at desc
      limit ${size} offset ${offset}
    )
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
      session.city as city,
      session.device as device,
      session.os as os,
      session.browser as browser,
      website_event.page_title as "pageTitle",
      website_event.event_type as "eventType",
      website_event.event_name as "eventName",
      exists(
        select 1
        from event_data
        where event_data.website_event_id = website_event.event_id
          and event_data.website_id = {{websiteId::uuid}}
        ${hasDataDateQuery}
      ) as "hasData"
    from paged_events
    join website_event on website_event.event_id = paged_events.event_id
    join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    order by paged_events.created_at desc
    `,
    queryParams,
    FUNCTION_NAME,
  );

  return {
    data,
    count,
    page: +page,
    pageSize: size,
    orderBy,
    isCapped: !!maxResults && +count >= +maxResults,
  };
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { search, page = 1, pageSize, maxResults, orderBy } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);
  const { queryParams, dateQuery, cohortQuery, filterQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = search
    ? `and ((positionCaseInsensitive(event_name, {search:String}) > 0 and event_type = ${EVENT_TYPE.customEvent})
           or (positionCaseInsensitive(url_path, {search:String}) > 0 and event_type = ${EVENT_TYPE.pageView}))`
    : '';

  const eventQuery = `
    select
      event_id,
      created_at
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and event_type != ${EVENT_TYPE.performance}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
  `;

  const countQuery = maxResults
    ? `select count(*) as num from (select 1 from (${eventQuery}) t limit ${+maxResults}) t2`
    : `select count(*) as num from (${eventQuery}) t`;

  const count = await rawQuery(countQuery, queryParams).then(res => res[0].num);

  const data = await rawQuery(
    `
    with paged_events as (
      ${eventQuery}
      order by created_at desc
      limit ${size} offset ${offset}
    )
    select
      website_event.event_id as id,
      website_event.website_id as websiteId, 
      website_event.session_id as sessionId,
      website_event.created_at as createdAt,
      website_event.hostname,
      website_event.url_path as urlPath,
      website_event.url_query as urlQuery,
      website_event.referrer_path as referrerPath,
      website_event.referrer_query as referrerQuery,
      website_event.referrer_domain as referrerDomain,
      website_event.country as country,
      website_event.city as city,
      website_event.device as device,
      website_event.os as os,
      website_event.browser as browser,
      website_event.page_title as pageTitle,
      website_event.event_type as eventType,
      website_event.event_name as eventName,
      website_event.event_id in (
        select event_id
        from event_data
        where website_id = {websiteId:UUID}
          ${dateQuery}
          and event_id in (select event_id from paged_events)
      ) as hasData
    from paged_events
    inner join website_event on website_event.event_id = paged_events.event_id
    order by paged_events.created_at desc
    `,
    queryParams,
    FUNCTION_NAME,
  );

  return {
    data,
    count,
    page: +page,
    pageSize: size,
    orderBy,
    search,
    isCapped: !!maxResults && +count >= +maxResults,
  };
}
