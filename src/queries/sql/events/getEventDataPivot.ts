import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { EventPropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataPivot';

export async function getEventDataPivot(
  ...args: [
    websiteId: string,
    eventName: string,
    filters: QueryFilters,
    eventFilters?: EventPropertyFilter[],
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  eventName: string,
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
) {
  const { timezone = 'utc' } = filters;
  const { pagedRawQuery, parseFilters, getPropertyFilterQuery, getDateStringSQL } = prisma;

  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(eventFilters, 'event', timezone);

  return pagedRawQuery(
    `
    with paged_events as (
      select website_event.event_id, max(website_event.created_at) as sort_created_at
      from website_event
      join event_data on event_data.website_event_id = website_event.event_id
        and event_data.website_id = {{websiteId::uuid}}
        and event_data.created_at between {{startDate}} and {{endDate}}
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_name = {{eventName}}
        ${filterQuery}
        ${pfSQL}
      group by website_event.event_id
    )
    select
      website_event.event_id as "eventId",
      website_event.session_id as "sessionId",
      website_event.event_name as "eventName",
      website_event.url_path as "urlPath",
      max(website_event.created_at) as "createdAt",
      array_agg(event_data.data_key order by event_data.data_key asc) as "propertyKeys",
      array_agg(
        coalesce(
          case when event_data.data_type = 1 then event_data.string_value end,
          case when event_data.data_type = 2 then cast(event_data.number_value as varchar) end,
          case when event_data.data_type = 3 then event_data.string_value end,
          case when event_data.data_type = 4 then ${getDateStringSQL('event_data.date_value', 'second', timezone)} end,
          case when event_data.data_type = 5 then event_data.string_value end,
          ''
        )
        order by event_data.data_key asc
      ) as "propertyValues"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
    join paged_events on paged_events.event_id = event_data.website_event_id
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    group by
      website_event.event_id,
      website_event.session_id,
      website_event.event_name,
      website_event.url_path,
      paged_events.sort_created_at
    order by paged_events.sort_created_at desc
    `,
    { ...queryParams, eventName, ...pfParams },
    filters,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string,
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
) {
  const { timezone = 'UTC' } = filters;
  const { pagedRawQuery, parseFilters, getPropertyFilterQuery, getDateStringSQL } = clickhouse;

  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(eventFilters, 'event', timezone);

  return pagedRawQuery(
    `
    select
      event_data_pivot.event_id as eventId,
      event_data_pivot.session_id as sessionId,
      event_data_pivot.event_name as eventName,
      event_data_pivot.url_path as urlPath,
      event_data_pivot.created_at as createdAt,
      groupArrayMerge(property_keys) as propertyKeys,
      arrayMap(
        (value, dataType) -> if(
          dataType = 4,
          ${getDateStringSQL('parseDateTimeBestEffortOrNull(value)', 'second', timezone)},
          value
        ),
        groupArrayMerge(property_values),
        groupArrayMerge(property_types)
      ) as propertyValues
    from umami.event_data_pivot
    any left join (
          select *
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and event_type = 2
            and event_name = {eventName:String}) website_event
    on website_event.event_id = event_data_pivot.event_id
      and website_event.session_id = event_data_pivot.session_id
      and website_event.website_id = event_data_pivot.website_id
    ${cohortQuery}
    where event_data_pivot.website_id = {websiteId:UUID}
      and event_data_pivot.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_data_pivot.event_name = {eventName:String}
    ${filterQuery}
    ${pfSQL}
    group by
      event_data_pivot.event_id,
      event_data_pivot.session_id,
      event_data_pivot.event_name,
      event_data_pivot.url_path,
      event_data_pivot.created_at
    order by event_data_pivot.created_at desc
    `,
    { ...queryParams, eventName, ...pfParams },
    filters,
    FUNCTION_NAME,
  );
}
