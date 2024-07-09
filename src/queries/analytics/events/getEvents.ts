import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { PageParams, QueryFilters } from 'lib/types';

export function getEvents(
  ...args: [websiteId: string, filters: QueryFilters, pageParams?: PageParams]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedQuery } = prisma;

  const where = {
    ...filters,
    id: websiteId,
  };

  return pagedQuery('website_event', { where }, pageParams);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedQuery, parseFilters } = clickhouse;
  const { params, dateQuery, filterQuery } = await parseFilters(websiteId, filters);

  return pagedQuery(
    `
    select
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
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
    order by created_at desc
    `,
    params,
    pageParams,
  );
}
