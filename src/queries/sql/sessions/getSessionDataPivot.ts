import clickhouse from '@/lib/clickhouse';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, PropertyFilter, QueryFilters, SessionDataPivotRow } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataPivot';

export async function getSessionDataPivot(
  ...args: [
    websiteId: string,
    propertyName: string,
    filters: QueryFilters,
    propertyFilters?: PropertyFilter[],
  ]
): Promise<PageResult<SessionDataPivotRow[]>> {
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
): Promise<PageResult<SessionDataPivotRow[]>> {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery } = prisma;
  const { page = 1, pageSize } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);

  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(
    propertyFilters,
    'session',
    timezone,
  );

  const countResult = await rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
        ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id
      from session_data
      join filtered_sessions
        on filtered_sessions.session_id = session_data.session_id
      where session_data.website_id = {{websiteId::uuid}}
        and session_data.data_key = {{propertyName}}
    )
    select count(*) as num
    from selected_property_sessions
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
  );

  const count = countResult[0].num;

  const rows = await rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
        ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id
      from session_data
      join filtered_sessions
        on filtered_sessions.session_id = session_data.session_id
      where session_data.website_id = {{websiteId::uuid}}
        and session_data.data_key = {{propertyName}}
    ),
    paged_sessions as (
      select session_data.session_id
      from session_data
      join selected_property_sessions
        on selected_property_sessions.session_id = session_data.session_id
      where session_data.website_id = {{websiteId::uuid}}
      group by session_data.session_id
      order by max(session_data.created_at) desc
      limit ${size} offset ${offset}
    )
    select
      session_data.session_id as "sessionId",
      coalesce(max(session_data.distinct_id), '') as "distinctId",
      max(session_data.created_at) as "createdAt",
      array_agg(session_data.data_key order by session_data.data_key asc) as "propertyKeys",
      array_agg(
        coalesce(
          case when session_data.data_type = 1 then session_data.string_value end,
          case when session_data.data_type = 2 then cast(session_data.number_value as varchar) end,
          case when session_data.data_type = 3 then session_data.string_value end,
          case when session_data.data_type = 4 then cast(session_data.date_value as varchar) end,
          case when session_data.data_type = 5 then session_data.string_value end,
          ''
        )
        order by session_data.data_key asc
      ) as "propertyValues"
    from session_data
    join paged_sessions on paged_sessions.session_id = session_data.session_id
    where session_data.website_id = {{websiteId::uuid}}
    group by session_data.session_id
    order by max(session_data.created_at) desc
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );

  return { data: rows, count, page: +page, pageSize: size };
}

async function clickhouseQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
): Promise<PageResult<SessionDataPivotRow[]>> {
  const { timezone = 'UTC' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery } = clickhouse;
  const { page = 1, pageSize } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);

  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(
    propertyFilters,
    'session',
    timezone,
  );

  const count = await rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
      ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id
      from session_data final
      join filtered_sessions on filtered_sessions.session_id = session_data.session_id
      where session_data.website_id = {websiteId:UUID}
        and session_data.data_key = {propertyName:String}
    )
    select count() as num
    from selected_property_sessions
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
  ).then((res: any) => res[0].num);

  const data = await rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
      ${pfSQL}
    ),
    selected_property_sessions as (
      select distinct session_data.session_id
      from session_data final
      join filtered_sessions on filtered_sessions.session_id = session_data.session_id
      where session_data.website_id = {websiteId:UUID}
        and session_data.data_key = {propertyName:String}
    )
    select
      session_data_pivot.session_id as sessionId,
      session_data_pivot.distinct_id as distinctId,
      maxMerge(session_data_pivot.created_at) as createdAt,
      groupArrayMerge(session_data_pivot.property_keys) as propertyKeys,
      groupArrayMerge(session_data_pivot.property_values) as propertyValues
    from umami.session_data_pivot session_data_pivot
    join selected_property_sessions
      on selected_property_sessions.session_id = session_data_pivot.session_id
    where session_data_pivot.website_id = {websiteId:UUID}
    group by
      session_data_pivot.session_id,
      session_data_pivot.distinct_id
    order by createdAt desc
    limit ${size} offset ${offset}
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );

  return { data, count, page: +page, pageSize: size };
}
