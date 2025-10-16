import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataEvents';

export interface WebsiteEventData {
  eventName?: string;
  propertyName: string;
  dataType: number;
  propertyValue?: string;
  total: number;
}

export async function getEventDataEvents(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { event } = filters;
  const { queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (event) {
    return rawQuery(
      `
      select
        website_event.event_name as "eventName",
        event_data.data_key as "propertyName",
        event_data.data_type as "dataType",
        event_data.string_value as "propertyValue",
        count(*) as "total"
      from event_data
      inner join website_event
        on website_event.event_id = event_data.website_event_id
      where event_data.website_id = {{websiteId::uuid}}
        and event_data.created_at between {{startDate}} and {{endDate}}
        and website_event.event_name = {{event}}
      group by website_event.event_name, event_data.data_key, event_data.data_type, event_data.string_value
      order by 1 asc, 2 asc, 3 asc, 5 desc
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      website_event.event_name as "eventName",
      event_data.data_key as "propertyName",
      event_data.data_type as "dataType",
      count(*) as "total"
    from event_data
    inner join website_event
      on website_event.event_id = event_data.website_event_id
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ eventName: string; propertyName: string; dataType: number; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { event } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (event) {
    return rawQuery(
      `
      select
        event_name as eventName,
        data_key as propertyName,
        data_type as dataType,
        string_value as propertyValue,
        count(*) as total
      from event_data
      join website_event
      on website_event.event_id = event_data.event_id
        and website_event.website_id = event_data.website_id
        and website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${cohortQuery}
      where event_data.website_id = {websiteId:UUID}
        and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_data.event_name = {event:String}
      ${filterQuery}
      group by data_key, data_type, string_value, event_name
      order by 1 asc, 2 asc, 3 asc, 5 desc
      limit 500
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      event_name as eventName,
      data_key as propertyName,
      data_type as dataType,
      count(*) as total
    from event_data
    join website_event
    on website_event.event_id = event_data.event_id
      and website_event.website_id = event_data.website_id
      and website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${cohortQuery}
    where event_data.website_id = {websiteId:UUID}
      and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    group by data_key, data_type, event_name
    order by 1 asc, 2 asc
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
