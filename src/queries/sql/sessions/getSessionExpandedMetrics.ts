import clickhouse from '@/lib/clickhouse';
import { FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionExpandedMetrics';

export interface SessionExpandedMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export interface SessionExpandedMetricsData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getSessionExpandedMetrics(
  ...args: [websiteId: string, parameters: SessionExpandedMetricsParameters, filters: QueryFilters]
): Promise<SessionExpandedMetricsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery, getTimestampDiffSQL } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
      },
      {
        joinSession: SESSION_COLUMNS.includes(type),
      },
    );
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        ${column} as "name",
        ${includeCountry ? 'country,' : ''}
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}  
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by name, website_event.session_id, website_event.visit_id
      ${includeCountry ? ', country' : ''}
    ) as t
    where name != ''
    group by name 
    ${includeCountry ? ', country' : ''}
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        ${column} name,
        ${includeCountry ? 'country,' : ''}
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        and name != ''
        ${filterQuery}
      group by name, session_id, visit_id
      ${includeCountry ? ', country' : ''}
    ) as t
    group by name
    ${includeCountry ? ', country' : ''}
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery, getTimestampDiffSQL } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, buildParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
      },
      {
        joinSession: SESSION_COLUMNS.includes(type),
      },
    );
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `LOWER(LEFT(${type}, 2))`;
  }

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      name,
      ${includeCountry ? 'country,' : ''}
      SUM(t.c) AS pageviews,
      COUNT(DISTINCT t.session_id) AS visitors,
      COUNT(DISTINCT t.visit_id) AS visits,
      SUM(CASE WHEN t.c = 1 THEN 1 ELSE 0 END) AS bounces,
      SUM(${getTimestampDiffSQL('t.min_time', 't.max_time')}) AS totaltime
    FROM (
      SELECT
        ${column} AS name,
        ${includeCountry ? 'country,' : ''}
        website_event.session_id,
        website_event.visit_id,
        COUNT(*) AS c,
        MIN(website_event.created_at) AS min_time,
        MAX(website_event.created_at) AS max_time
      FROM website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
        AND website_event.created_at BETWEEN ? AND ?
        AND website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      GROUP BY name, website_event.session_id, website_event.visit_id
      ${includeCountry ? ', country' : ''}
    ) AS t
    WHERE name != ''
    GROUP BY name
    ${includeCountry ? ', country' : ''}
    ORDER BY visitors DESC, visits DESC
    LIMIT ${limit}
    OFFSET ${offset}
    `,
    params,
    FUNCTION_NAME,
  );
}
