import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getOutboundLinks';

export function getOutboundLinks(...args: [websiteId: string, filters: QueryFilters]) {
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
  });

  const searchQuery = search
    ? `and (ed_url.string_value ilike {{search}} or ed_domain.string_value ilike {{search}})`
    : '';

  return pagedRawQuery(
    `
    select
      website_event.event_id as "id",
      website_event.website_id as "websiteId",
      website_event.session_id as "sessionId",
      website_event.created_at as "createdAt",
      website_event.url_path as "urlPath",
      website_event.hostname,
      session.country as country,
      session.city as city,
      session.device as device,
      session.os as os,
      session.browser as browser,
      ed_url.string_value as "outboundUrl",
      ed_domain.string_value as "outboundDomain"
    from website_event
    ${cohortQuery}
    join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    left join event_data ed_url on ed_url.website_event_id = website_event.event_id
      and ed_url.website_id = website_event.website_id
      and ed_url.data_key = 'url'
    left join event_data ed_domain on ed_domain.website_event_id = website_event.event_id
      and ed_domain.website_id = website_event.website_id
      and ed_domain.data_key = 'domain'
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type = 2
      and website_event.event_name = 'outbound-link'
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
    ? `and (ed_url.string_value ilike {search:String} or ed_domain.string_value ilike {search:String})`
    : '';

  return pagedRawQuery(
    `
    select
      we.event_id as id,
      we.website_id as websiteId,
      we.session_id as sessionId,
      we.created_at as createdAt,
      we.url_path as urlPath,
      we.hostname,
      we.country as country,
      we.city as city,
      we.device as device,
      we.os as os,
      we.browser as browser,
      ed_url.string_value as outboundUrl,
      ed_domain.string_value as outboundDomain
    from website_event we
    ${cohortQuery}
    left join event_data ed_url on ed_url.event_id = we.event_id
      and ed_url.website_id = we.website_id
      and ed_url.data_key = 'url'
    left join event_data ed_domain on ed_domain.event_id = we.event_id
      and ed_domain.website_id = we.website_id
      and ed_domain.data_key = 'domain'
    where we.website_id = {websiteId:UUID}
      and we.event_type = 2
      and we.event_name = 'outbound-link'
      ${dateQuery}
      ${filterQuery}
      ${searchQuery}
    order by we.created_at desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}
