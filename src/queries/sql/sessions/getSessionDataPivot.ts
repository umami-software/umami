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
  const { rawQuery, parseFilters, getPropertyFilterQuery, getDateStringSQL } = prisma;
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

  const countResult = (await rawQuery(
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
  )) as { num: number }[];

  const count = countResult[0].num;

  const rows = (await rawQuery(
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
    latest_session_properties as (
      select
        ranked.session_id,
        ranked.distinct_id,
        ranked.created_at,
        ranked.data_key,
        ranked.data_type,
        ranked.string_value,
        ranked.number_value,
        ranked.date_value
      from (
        select
          session_data.session_id,
          session_data.distinct_id,
          session_data.created_at,
          session_data.data_key,
          session_data.data_type,
          session_data.string_value,
          session_data.number_value,
          session_data.date_value,
          row_number() over (
            partition by session_data.session_id, session_data.data_key
            order by session_data.created_at desc, session_data.session_data_id desc
          ) as row_num
        from session_data
        join selected_property_sessions
          on selected_property_sessions.session_id = session_data.session_id
        where session_data.website_id = {{websiteId::uuid}}
      ) ranked
      where ranked.row_num = 1
    ),
    paged_sessions as (
      select latest_session_properties.session_id
      from latest_session_properties
      group by latest_session_properties.session_id
      order by max(latest_session_properties.created_at) desc
      limit ${size} offset ${offset}
    )
    select
      latest_session_properties.session_id as "sessionId",
      coalesce(max(latest_session_properties.distinct_id), '') as "distinctId",
      max(latest_session_properties.created_at) as "createdAt",
      array_agg(latest_session_properties.data_key order by latest_session_properties.data_key asc) as "propertyKeys",
      array_agg(
        coalesce(
          case when latest_session_properties.data_type = 1 then latest_session_properties.string_value end,
          case when latest_session_properties.data_type = 2 then cast(latest_session_properties.number_value as varchar) end,
          case when latest_session_properties.data_type = 3 then latest_session_properties.string_value end,
          case when latest_session_properties.data_type = 4 then ${getDateStringSQL('latest_session_properties.date_value', 'second', timezone)} end,
          case when latest_session_properties.data_type = 5 then latest_session_properties.string_value end,
          ''
        )
        order by latest_session_properties.data_key asc
      ) as "propertyValues"
    from latest_session_properties
    join paged_sessions on paged_sessions.session_id = latest_session_properties.session_id
    group by latest_session_properties.session_id
    order by max(latest_session_properties.created_at) desc
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  )) as SessionDataPivotRow[];

  return { data: rows, count, page: +page, pageSize: size };
}

async function clickhouseQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
): Promise<PageResult<SessionDataPivotRow[]>> {
  const { timezone = 'UTC' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery, getDateStringSQL } = clickhouse;
  const { page = 1, pageSize } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);

  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(
    propertyFilters,
    'session',
    timezone,
  );

  const countResult = (await rawQuery(
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
  )) as { num: number }[];
  const count = countResult[0].num;

  const data = (await rawQuery(
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
    ),
    latest_session_properties as (
      select
        session_data.session_id as session_id,
        argMax(ifNull(session_data.distinct_id, ''), session_data.created_at) as distinct_id,
        session_data.data_key as data_key,
        argMax(session_data.data_type, session_data.created_at) as data_type,
        argMax(session_data.string_value, session_data.created_at) as string_value,
        argMax(session_data.number_value, session_data.created_at) as number_value,
        argMax(session_data.date_value, session_data.created_at) as date_value,
        max(session_data.created_at) as created_at
      from session_data final
      join selected_property_sessions
        on selected_property_sessions.session_id = session_data.session_id
      where session_data.website_id = {websiteId:UUID}
      group by
        session_data.session_id,
        session_data.data_key
    ),
    paged_sessions as (
      select
        latest_session_properties.session_id
      from latest_session_properties
      group by latest_session_properties.session_id
      order by max(latest_session_properties.created_at) desc
      limit ${size} offset ${offset}
    )
    select
      latest_session_properties.session_id as sessionId,
      max(latest_session_properties.distinct_id) as distinctId,
      max(latest_session_properties.created_at) as createdAt,
      groupArray(latest_session_properties.data_key) as propertyKeys,
      groupArray(
        multiIf(
          latest_session_properties.data_type IN (1, 3, 5), ifNull(latest_session_properties.string_value, ''),
          latest_session_properties.data_type = 2, toString(ifNull(latest_session_properties.number_value, 0)),
          latest_session_properties.data_type = 4, ${getDateStringSQL('latest_session_properties.date_value', 'second', timezone)},
          ''
        )
      ) as propertyValues
    from latest_session_properties
    join paged_sessions
      on paged_sessions.session_id = latest_session_properties.session_id
    group by
      latest_session_properties.session_id
    order by createdAt desc
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  )) as SessionDataPivotRow[];

  return { data, count, page: +page, pageSize: size };
}
