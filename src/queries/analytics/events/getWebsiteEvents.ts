import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { PageParams, QueryFilters } from 'lib/types';

export function getWebsiteEvents(
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
  const { pagedQuery, parseFilters, getDateStringSQL } = clickhouse;
  const { params, dateQuery, filterQuery } = await parseFilters(websiteId, filters);
  const { query } = pageParams;

  return pagedQuery(
    `
    select
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      ${getDateStringSQL('created_at', 'second', filters.timezone)} as createdAt,
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
    ${query ? `and (positionCaseInsensitive(event_name, {query:String}) > 0)` : ''}
    order by created_at desc
    `,
    { ...params, query },
    pageParams,
  );
}
