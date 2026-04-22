import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteEventStats';

export interface WebsiteEventStatsData {
  events: number;
  visitors: number;
  visits: number;
  uniqueEvents: number;
}

export async function getWebsiteEventStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteEventStatsData[]> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      cast(coalesce(sum(t.c), 0) as bigint) as "events",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      count(distinct t.event_name) as "uniqueEvents"
    from (
      select
        website_event.session_id,
        website_event.visit_id,
        website_event.event_name,
        count(*) as "c"
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}  
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type = 2
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
): Promise<WebsiteEventStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "events",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      count(distinct t.event_name) as "uniqueEvents"
    from (
      select
        session_id,
        visit_id,
        event_name,
        count(*) c
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2
        ${filterQuery}
      group by session_id, visit_id, event_name
    ) as t;
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteEventStatsData[]> {
  const { parseFilters, rawQuery } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      CAST(COALESCE(SUM(t.c), 0) AS SIGNED) AS events,
      COUNT(DISTINCT t.session_id) AS visitors,
      COUNT(DISTINCT t.visit_id) AS visits,
      COUNT(DISTINCT t.event_name) AS uniqueEvents
    FROM (
      SELECT
        website_event.session_id,
        website_event.visit_id,
        website_event.event_name,
        COUNT(*) AS c
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
        AND website_event.created_at BETWEEN ? AND ?
        AND website_event.event_type = 2
        ${filterQuery}
      GROUP BY 1, 2, 3
    ) AS t
    `,
    params,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}
