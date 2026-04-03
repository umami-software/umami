import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getOutboundLinkMetrics';

export function getOutboundLinkMetrics(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { parseFilters, rawQuery } = prisma;
  const { type, limit = 10 } = filters;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const column = type === 'domain' ? 'domain' : 'url';

  return rawQuery(
    `
    select
      ed.string_value as "${column}",
      count(*) as "clicks",
      count(distinct website_event.session_id) as "visitors"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join event_data ed on ed.website_event_id = website_event.event_id
      and ed.website_id = website_event.website_id
      and ed.data_key = {{type}}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = 2
      and website_event.event_name = 'outbound-link'
      ${filterQuery}
    group by ed.string_value
    order by "clicks" desc
    limit {{limit}}
    `,
    { ...queryParams, type, limit },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { type, limit = 10 } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const column = type === 'domain' ? 'domain' : 'url';

  return rawQuery(
    `
    select
      ed.string_value as "${column}",
      count(*) as "clicks",
      uniq(we.session_id) as "visitors"
    from website_event we
    ${cohortQuery}
    join event_data ed on ed.event_id = we.event_id
      and ed.website_id = we.website_id
      and ed.data_key = {type:String}
    where we.website_id = {websiteId:UUID}
      and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and we.event_type = 2
      and we.event_name = 'outbound-link'
      ${filterQuery}
    group by ed.string_value
    order by "clicks" desc
    limit {limit:UInt32}
    `,
    { ...queryParams, type, limit },
    FUNCTION_NAME,
  );
}
