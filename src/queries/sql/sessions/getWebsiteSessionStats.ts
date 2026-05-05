import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteSessionStats';

export interface WebsiteSessionStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  countries: number;
  events: number;
}

export async function getWebsiteSessionStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteSessionStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteSessionStatsData[]> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      count(*) as "pageviews",
      count(distinct website_event.session_id) as "visitors",
      count(distinct website_event.visit_id) as "visits",
      count(distinct session.country) as "countries",
      sum(case when website_event.event_type = 2 then 1 else 0 end) as "events"
    from website_event
    ${cohortQuery}
    join session on website_event.session_id = session.session_id
      and website_event.website_id = session.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteSessionStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sumIf(1, event_type = 1) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      uniq(country) as "countries",
      sumIf(1, event_type = 2) as "events"
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
    `;
  } else {
    sql = `
    select
      sum(views) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      uniq(country) as "countries",
      sum(length(event_name)) as "events"
    from website_event_stats_hourly website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteSessionStatsData[]> {
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, cohortQuery, buildParams } = parseFilters({ ...filters, websiteId });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      COUNT(*) AS pageviews,
      COUNT(DISTINCT website_event.session_id) AS visitors,
      COUNT(DISTINCT website_event.visit_id) AS visits,
      COUNT(DISTINCT session.country) AS countries,
      SUM(CASE WHEN website_event.event_type = 2 THEN 1 ELSE 0 END) AS events
    FROM website_event
    ${cohortQuery}
    JOIN session ON website_event.session_id = session.session_id
      AND website_event.website_id = session.website_id
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      ${filterQuery}
    `,
    params,
    FUNCTION_NAME,
  );
}
