import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataPropertySeries';

export async function getEventDataPropertySeries(
  ...args: [websiteId: string, eventName: string, propertyName: string, filters: QueryFilters]
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
  filters: QueryFilters,
) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      event_data.string_value as x,
      ${getDateSQL('event_data.created_at', unit, timezone)} t,
      count(*) y
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
      and event_data.data_type = 1
      ${filterQuery}
    group by 1, 2
    order by 2
    `,
    { ...queryParams, eventName, propertyName },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  filters: QueryFilters,
): Promise<{ x: string; t: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  return rawQuery(
    `
    select
      event_data.string_value as x,
      ${getDateSQL('event_data.created_at', unit, timezone)} as t,
      count() as y
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
      and event_data.data_type = 1
    ${filterQuery}
    group by x, t
    order by t
    `,
    { ...queryParams, eventName, propertyName },
    FUNCTION_NAME,
  );
}
