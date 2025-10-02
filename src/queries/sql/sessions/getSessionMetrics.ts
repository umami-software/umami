import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionMetrics';

export interface SessionMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export async function getSessionMetrics(
  ...args: [websiteId: string, parameters: SessionMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionMetricsParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
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
      ${column} x,
      count(distinct website_event.session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type != 2
    ${filterQuery}
    group by 1 
    ${includeCountry ? ', 3' : ''}
    order by 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: SessionMetricsParameters,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      ${column} x,
      count(distinct session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type != 2
      ${filterQuery}
    group by x 
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  } else {
    sql = `
    select
      ${column} x,
      uniq(session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event_stats_hourly as website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type != 2
      ${filterQuery}
    group by x 
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  }

  return rawQuery(sql, { ...queryParams, ...parameters }, FUNCTION_NAME);
}
