import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getOutboundLinkStats';

export interface OutboundLinkStatsData {
  clicks: number;
  visitors: number;
  visits: number;
  uniqueLinks: number;
}

export async function getOutboundLinkStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<OutboundLinkStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<OutboundLinkStatsData[]> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "clicks",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      count(distinct t.url) as "uniqueLinks"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        ed_url.string_value as url,
        count(*) as c
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      left join event_data ed_url on ed_url.website_event_id = website_event.event_id
        and ed_url.website_id = website_event.website_id
        and ed_url.data_key = 'url'
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type = 2
        and website_event.event_name = 'outbound-link'
        ${filterQuery}
      group by 1, 2, 3
    ) as t
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<OutboundLinkStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "clicks",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      count(distinct t.url) as "uniqueLinks"
    from (
      select
        we.session_id,
        we.visit_id,
        ed_url.string_value as url,
        count(*) c
      from website_event we
      ${cohortQuery}
      left join event_data ed_url on ed_url.event_id = we.event_id
        and ed_url.website_id = we.website_id
        and ed_url.data_key = 'url'
      where we.website_id = {websiteId:UUID}
        and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and we.event_type = 2
        and we.event_name = 'outbound-link'
        ${filterQuery}
      group by we.session_id, we.visit_id, ed_url.string_value
    ) as t;
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}
