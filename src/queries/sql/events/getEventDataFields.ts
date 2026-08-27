import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataFields';

export async function getEventDataFields(
  ...args: [websiteId: string, eventName: string | undefined, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  eventName: string | undefined,
  filters: QueryFilters,
) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const eventNameFilter = eventName ? 'and website_event.event_name = {{eventName}}' : '';

  return rawQuery(
    `
    select
      data_key as "propertyName",
      data_type as "dataType",
      count(*) as "total"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${eventNameFilter}
    ${cohortQuery}
    ${joinSessionQuery}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by data_key, data_type
    order by "total" desc, "propertyName" asc
    `,
    { ...queryParams, eventName },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string | undefined,
  filters: QueryFilters,
): Promise<{ propertyName: string; dataType: number; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });
  const eventNameFilter = eventName ? 'and event_name = {eventName:String}' : '';
  const eventDataNameFilter = eventName ? 'and event_data.event_name = {eventName:String}' : '';

  return rawQuery(
    `
    select
      data_key as propertyName,
      data_type as dataType,
      count(*) as "total"
    from event_data
    any left join (
          select *
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            ${eventNameFilter}
            and event_type = 2) website_event
    on website_event.event_id = event_data.event_id
      and website_event.session_id = event_data.session_id
      and website_event.website_id = event_data.website_id
    ${cohortQuery}
    where event_data.website_id = {websiteId:UUID}
      and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${eventDataNameFilter}
    ${filterQuery}
    group by data_key, data_type
    order by total desc, propertyName asc
    `,
    { ...queryParams, eventName },
    FUNCTION_NAME,
  );
}
