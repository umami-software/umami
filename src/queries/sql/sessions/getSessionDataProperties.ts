import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataProperties';

export async function getSessionDataProperties(
  ...args: [
    websiteId: string,
    filters: QueryFilters,
    propertyFilters?: PropertyFilter[],
    propertyName?: string,
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
  propertyName?: string,
) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(
    propertyFilters,
    'session',
    timezone,
  );

  return rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id, website_event.website_id
      from website_event 
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type != ${EVENT_TYPE.performance}
        ${filterQuery}
        ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id, session_data.website_id
      from session_data
      join filtered_sessions
        on filtered_sessions.session_id = session_data.session_id
        and filtered_sessions.website_id = session_data.website_id
      ${propertyName ? 'where session_data.data_key = {{propertyName}}' : ''}
    )
    select
        data_key as "propertyName",
        data_type as "dataType",
        count(distinct session_data.session_id) as "total"
    from selected_property_sessions
    join session_data 
        on session_data.session_id = selected_property_sessions.session_id
          and session_data.website_id = selected_property_sessions.website_id
    group by 1, 2
    order by 3 desc, 1 asc
    limit 500
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
  propertyName?: string,
): Promise<{ propertyName: string; dataType: number; total: number }[]> {
  const { timezone = 'UTC' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(
    propertyFilters,
    'session',
    timezone,
  );

  return rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id, website_event.website_id
      from website_event
      ${cohortQuery}
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and website_event.event_type != ${EVENT_TYPE.performance}
      ${filterQuery}
      ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id, session_data.website_id
      from session_data final
      join filtered_sessions
        on filtered_sessions.session_id = session_data.session_id
        and filtered_sessions.website_id = session_data.website_id
      ${propertyName ? 'where session_data.data_key = {propertyName:String}' : ''}
    )
    select
      data_key as propertyName,
      data_type as dataType,
      count(distinct session_data.session_id) as total
    from selected_property_sessions
    join session_data final
      on session_data.session_id = selected_property_sessions.session_id
        and session_data.website_id = selected_property_sessions.website_id
    where session_data.website_id = {websiteId:UUID}
      and session_data.data_key != ''
    group by 1, 2
    order by 3 desc, 1 asc
    limit 500
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}
