import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { EventDataNumericStats, EventPropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataNumericStats';

export async function getEventDataNumericStats(
  ...args: [
    websiteId: string,
    eventName: string,
    propertyName: string,
    filters: QueryFilters,
    eventFilters?: EventPropertyFilter[],
  ]
): Promise<EventDataNumericStats> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  }).then(results => results?.[0]);
}

async function relationalQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
) {
  const { rawQuery, parseFilters, getEventPropertyFilterQuery } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const { sql: epfSQL, params: epfParams } = getEventPropertyFilterQuery(eventFilters);

  return rawQuery(
    `
    select
      coalesce(sum(cast(event_data.number_value as decimal)), 0) as "total",
      coalesce(avg(cast(event_data.number_value as decimal)), 0) as "average",
      coalesce(percentile_cont(0.5) within group (order by event_data.number_value), 0) as "median",
      coalesce(max(event_data.number_value), 0) as "max",
      coalesce(min(event_data.number_value), 0) as "min"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = 2
      and website_event.event_name = {{eventName}}
    ${cohortQuery}
    ${joinSessionQuery}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
      and event_data.data_key = {{propertyName}}
      and event_data.data_type = 2
      ${filterQuery}
      ${epfSQL}
    `,
    { ...queryParams, eventName, propertyName, ...epfParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
): Promise<EventDataNumericStats[]> {
  const { rawQuery, parseFilters, getEventPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });
  const { sql: epfSQL, params: epfParams } = getEventPropertyFilterQuery(eventFilters);

  return rawQuery(
    `
    select
      if(count() = 0, 0, sum(event_data.number_value)) as total,
      if(count() = 0, 0, avg(event_data.number_value)) as average,
      if(count() = 0, 0, median(event_data.number_value)) as median,
      if(count() = 0, 0, max(event_data.number_value)) as max,
      if(count() = 0, 0, min(event_data.number_value)) as min
    from event_data
    any left join (
          select *
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and event_type = 2
            and event_name = {eventName:String}) website_event
    on website_event.event_id = event_data.event_id
      and website_event.session_id = event_data.session_id
      and website_event.website_id = event_data.website_id
    ${cohortQuery}
    where event_data.website_id = {websiteId:UUID}
      and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_data.data_key = {propertyName:String}
      and event_data.data_type = 2
    ${filterQuery}
    ${epfSQL}
    `,
    { ...queryParams, eventName, propertyName, ...epfParams },
    FUNCTION_NAME,
  );
}
