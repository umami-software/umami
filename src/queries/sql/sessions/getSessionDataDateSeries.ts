import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { EventDataDateSeriesPoint, PropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataDateSeries';

export async function getSessionDataDateSeries(
  ...args: [
    websiteId: string,
    propertyName: string,
    filters: QueryFilters,
    propertyFilters?: PropertyFilter[],
  ]
): Promise<EventDataDateSeriesPoint[]> {
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
): Promise<EventDataDateSeriesPoint[]> {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters, getDateStringSQL, getPropertyFilterQuery } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);

  return rawQuery(
    `
    select
      ${getDateStringSQL('session_data.date_value', 'second', timezone)} as t,
      count(distinct session_data.session_id) as y
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join session_data
      on session_data.session_id = website_event.session_id
        and session_data.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and session_data.data_key = {{propertyName}}
      and session_data.data_type = ${DATA_TYPE.date}
      ${filterQuery}
      ${pfSQL}
    group by 1
    order by 1
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
): Promise<EventDataDateSeriesPoint[]> {
  const { timezone = 'UTC' } = filters;
  const { rawQuery, parseFilters, getDateStringSQL, getPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);

  return rawQuery(
    `
    select
      ${getDateStringSQL('session_data.date_value', 'second', timezone)} as t,
      uniq(session_data.session_id) as y
    from website_event
    ${cohortQuery}
    join session_data final
      on session_data.session_id = website_event.session_id
        and session_data.website_id = {websiteId:UUID}
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and session_data.data_key = {propertyName:String}
      and session_data.data_type = ${DATA_TYPE.date}
    ${filterQuery}
    ${pfSQL}
    group by t
    order by t
    `,
    { ...queryParams, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}
