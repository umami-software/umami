import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { EventDataSeriesPoint, PropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataPropertySeries';

export async function getSessionDataPropertySeries(
  ...args: [
    websiteId: string,
    propertyName: string,
    filters: QueryFilters,
    propertyFilters?: PropertyFilter[],
  ]
): Promise<EventDataSeriesPoint[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
): Promise<EventDataSeriesPoint[]> {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters, getPropertyFilterQuery } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);

  return rawQuery(
    `
    select
      session_data.string_value as x,
      ${getDateSQL('session_data.created_at', unit, timezone)} t,
      count(distinct session_data.session_id) y
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join session_data
      on session_data.session_id = website_event.session_id
        and session_data.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and session_data.data_key = {{propertyName}}
      and session_data.data_type in (${DATA_TYPE.string}, ${DATA_TYPE.boolean})
      ${filterQuery}
      ${pfSQL}
    group by 1, 2
    order by 2
    `,
    { ...queryParams, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
): Promise<EventDataSeriesPoint[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters, getPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);

  return rawQuery(
    `
    select
      session_data.string_value as x,
      ${getDateSQL('session_data.created_at', unit, timezone)} as t,
      uniq(session_data.session_id) as y
    from website_event
    ${cohortQuery}
    join session_data final
      on session_data.session_id = website_event.session_id
        and session_data.website_id = {websiteId:UUID}
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and session_data.data_key = {propertyName:String}
      and session_data.data_type in (${DATA_TYPE.string}, ${DATA_TYPE.boolean})
    ${filterQuery}
    ${pfSQL}
    group by x, t
    order by t
    `,
    { ...queryParams, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}
