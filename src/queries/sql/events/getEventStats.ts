import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventStats';

export interface EventStatsParameters {
  limit?: number | string;
}

interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export async function getEventStats(
  ...args: [websiteId: string, parameters: EventStatsParameters, filters: QueryFilters]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventStatsParameters,
  filters: QueryFilters,
) {
  const { limit } = parameters;
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const limitQuery = limit
    ? `and event_name in (
    select event_name
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_type = 2
    group by event_name
    order by count(*) desc
    limit ${limit}
  )`
    : '';

  return rawQuery(
    `
    select
      event_name x,
      ${getDateSQL('website_event.created_at', unit, timezone)} t,
      count(*) y
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = 2
      ${filterQuery}
      ${limitQuery}
    group by 1, 2
    order by 2
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: EventStatsParameters,
  filters: QueryFilters,
): Promise<{ x: string; t: string; y: number }[]> {
  const { limit } = parameters;
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const limitQuery = limit
    ? `and event_name in (
    select event_name
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = 2
    group by event_name
    order by count(*) desc
    limit ${limit}
  )`
    : '';

  let sql = '';

  if (filterQuery || cohortQuery) {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = 2
      ${filterQuery}
      ${limitQuery}
    group by x, t
    order by t
    `;
  } else {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from (
      select arrayJoin(event_name) as event_name,
        created_at
      from website_event_stats_hourly website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2
        ${limitQuery}
    ) as g
    group by x, t
    order by t
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: EventStatsParameters,
  filters: QueryFilters,
) {
  const { limit } = parameters;
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = oceanbase;
  const { filterQuery, cohortQuery, joinSessionQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const limitQuery = limit
    ? `AND event_name IN (
    SELECT event_name
    FROM website_event
    WHERE website_id = ?
      AND created_at BETWEEN ? AND ?
      AND event_type = 2
    GROUP BY event_name
    ORDER BY COUNT(*) DESC
    LIMIT ${limit}
  )`
    : '';

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  // limitQuery adds 3 more placeholders (websiteId, startDate, endDate)
  const finalParams = limit
    ? [...params, websiteId, filters.startDate, filters.endDate]
    : params;

  return rawQuery(
    `
    SELECT
      event_name x,
      ${getDateSQL('website_event.created_at', unit, timezone)} t,
      COUNT(*) y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      AND website_event.event_type = 2
      ${filterQuery}
      ${limitQuery}
    GROUP BY 1, 2
    ORDER BY 2
    `,
    finalParams,
    FUNCTION_NAME,
  );
}
