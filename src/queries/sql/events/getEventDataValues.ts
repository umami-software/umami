import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataValues';

interface WebsiteEventData {
  value: string;
  total: number;
}

export async function getEventDataValues(
  ...args: [
    websiteId: string,
    eventName: string,
    filters: QueryFilters & { propertyName?: string; dataType?: number },
  ]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  eventName: string,
  filters: QueryFilters & { propertyName?: string; dataType?: number },
) {
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { dataType } = filters;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (dataType === DATA_TYPE.array) {
    return rawQuery(
      `
      select
        array_item.value as "value",
        count(*) as "total"
      from event_data
      join website_event on website_event.event_id = event_data.website_event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type = 2
        and website_event.event_name = {{eventName}}
      cross join lateral jsonb_array_elements_text(coalesce(event_data.string_value, '[]')::jsonb) as array_item(value)
      ${cohortQuery}
      ${joinSessionQuery}
      where event_data.website_id = {{websiteId::uuid}}
        and event_data.created_at between {{startDate}} and {{endDate}}
        and event_data.data_key = {{propertyName}}
        and event_data.data_type = ${DATA_TYPE.array}
      ${filterQuery}
      group by array_item.value
      order by 2 desc
      limit 100
      `,
      { ...queryParams, eventName },
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      case
        when data_type = 2 then replace(string_value, '.0000', '')
        when data_type = 4 then ${getDateSQL('date_value', 'hour')}
        else string_value
      end as "value",
      count(*) as "total"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = 2
      and website_event.event_name = {eventName:String}
    ${cohortQuery}
    ${joinSessionQuery}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
      and event_data.data_key = {{propertyName}}
      ${dataType ? `and event_data.data_type = ${dataType}` : ''}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    { ...queryParams, eventName },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  eventName: string,
  filters: QueryFilters & { propertyName?: string; dataType?: number },
): Promise<{ value: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { dataType } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  if (dataType === DATA_TYPE.array) {
    return rawQuery(
      `
      select
        arrayJoin(JSONExtract(ifNull(event_data.string_value, '[]'), 'Array(String)')) as "value",
        count(*) as "total"
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
        and event_data.event_name = {eventName:String}
        and event_data.data_key = {propertyName:String}
        and event_data.data_type = ${DATA_TYPE.array}
      ${filterQuery}
      group by value
      order by 2 desc
      limit 100
      `,
      { ...queryParams, eventName },
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      count(*) as "total"
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
      and event_data.event_name = {eventName:String}
      and event_data.data_key = {propertyName:String}
      ${dataType ? `and event_data.data_type = ${dataType}` : ''}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    { ...queryParams, eventName },
    FUNCTION_NAME,
  );
}
