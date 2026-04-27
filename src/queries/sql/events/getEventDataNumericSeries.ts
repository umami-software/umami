import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { EventPropertyFilter, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataNumericSeries';

export async function getEventDataNumericSeries(
  ...args: [
    websiteId: string,
    eventName: string,
    propertyName: string,
    metric: 'sum' | 'avg' | 'count',
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
  propertyName: string,
  metric: 'sum' | 'avg' | 'count',
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters, getEventPropertyFilterQuery } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: epfSQL, params: epfParams } = getEventPropertyFilterQuery(eventFilters, timezone);
  const aggSql =
    metric === 'avg' ? 'avg(cast(event_data.number_value as decimal))' :
    metric === 'count' ? 'count(*)' :
    'sum(cast(event_data.number_value as decimal))';

  return rawQuery(
    `
    select
      ${getDateSQL('event_data.created_at', unit, timezone)} t,
      ${aggSql} y
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
    group by 1
    order by 1
    `,
    { ...queryParams, eventName, propertyName, ...epfParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  metric: 'sum' | 'avg' | 'count',
  filters: QueryFilters,
  eventFilters: EventPropertyFilter[] = [],
): Promise<{ t: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters, getEventPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: epfSQL, params: epfParams } = getEventPropertyFilterQuery(eventFilters, timezone);
  const aggSql =
    metric === 'avg' ? 'avg(event_data.number_value)' :
    metric === 'count' ? 'count()' :
    'sum(event_data.number_value)';

  return rawQuery(
    `
    select
      ${getDateSQL('event_data.created_at', unit, timezone)} as t,
      ${aggSql} as y
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
    group by t
    order by t
    `,
    { ...queryParams, eventName, propertyName, ...epfParams },
    FUNCTION_NAME,
  );
}
