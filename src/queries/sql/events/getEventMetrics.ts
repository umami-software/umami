import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventMetrics';

export interface EventMetricParameters {
  type: string;
  limit?: string;
  offset?: string;
}

export interface EventMetricData {
  x: string;
  t: string;
  y: number;
}

export async function getEventMetrics(
  ...args: [websiteId: string, parameters: EventMetricParameters, filters: QueryFilters]
): Promise<EventMetricData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventMetricParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: EVENT_TYPE.customEvent,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  return rawQuery(
    `
    select ${column} x,
      count(*) as y
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    group by 1
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
  parameters: EventMetricParameters,
  filters: QueryFilters,
): Promise<EventMetricData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `select ${column} x,
            count(*) as y
     from website_event
      ${cohortQuery}
     where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
     group by x
     order by y desc
         limit ${limit}
     offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: EventMetricParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, cohortQuery, joinSessionQuery, buildParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: EVENT_TYPE.customEvent,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT ${column} x,
      COUNT(*) AS y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT ${limit}
    OFFSET ${offset}
    `,
    params,
    FUNCTION_NAME,
  );
}
