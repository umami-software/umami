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
  const searchParams = search ? { eventSearch: `%${search}%` } : {};

  const searchQuery = search
    ? `and ((event_name ilike {{eventSearch}} and event_type = ${EVENT_TYPE.customEvent})
           or (url_path ilike {{eventSearch}} and event_type = ${EVENT_TYPE.pageView}))`
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

  const countFromQuery = `
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
    : `select count(*) as num ${countFromQuery}`;

  const count = await rawQuery(countQuery, { ...queryParams, ...searchParams }).then(res =>
    Number(res[0].num),
  );

  const data = await rawQuery(
    `
    with paged_events as (
      ${eventQuery}
      order by created_at desc
      limit ${size} offset ${offset}
    ),
    paged_event_data as (
      select distinct event_data.website_event_id as event_id
      from event_data
      join paged_events on paged_events.event_id = event_data.website_event_id
      where event_data.website_id = {{websiteId::uuid}}
      ${hasDataDateQuery}
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
      (paged_event_data.event_id is not null) as "hasData"
    from paged_events
    join website_event on website_event.event_id = paged_events.event_id
    join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    left join paged_event_data on paged_event_data.event_id = website_event.event_id
    order by paged_events.created_at desc
    `,
    { ...queryParams, ...searchParams },
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
  const hasDataDateQuery = dateQuery.replaceAll('created_at', 'event_data_pivot.created_at');

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

  const countFromQuery = `
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
    : `select count(*) as num ${countFromQuery}`;

  const count = await rawQuery(countQuery, queryParams).then(res => res[0].num);

  const data = await rawQuery(
    `
    with paged_events as (
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
        country,
        city,
        device,
        os,
        browser,
        page_title as pageTitle,
        event_type as eventType,
        event_name as eventName
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != ${EVENT_TYPE.performance}
      ${dateQuery}
      ${filterQuery}
      ${searchQuery}
      order by created_at desc
      limit ${size} offset ${offset}
    ),
    paged_event_data as (
      select
        event_id,
        toUInt8(1) as has_data
      from umami.event_data_pivot
      inner join paged_events on paged_events.id = event_data_pivot.event_id
      where website_id = {websiteId:UUID}
      ${hasDataDateQuery}
      group by event_id
    )
    select
      paged_events.*,
      ifNull(paged_event_data.has_data, 0) as hasData
    from paged_events
    left join paged_event_data on paged_event_data.event_id = paged_events.id
    order by paged_events.createdAt desc
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
