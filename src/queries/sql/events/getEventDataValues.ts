import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { QueryFilters, WebsiteEventData } from '@/lib/types';

export async function getEventDataValues(
  ...args: [
    websiteId: string,
    filters: QueryFilters & { eventName?: string; propertyName?: string },
  ]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { eventName?: string; propertyName?: string },
) {
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, filters);

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
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
      and event_data.data_key = {{propertyName}}
      and website_event.event_name = {{eventName}}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { eventName?: string; propertyName?: string },
): Promise<{ value: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      count(*) as "total"
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and data_key = {propertyName:String}
      and event_name = {eventName:String}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    params,
  );
}
