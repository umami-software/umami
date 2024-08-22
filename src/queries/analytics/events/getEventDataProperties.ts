import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { QueryFilters, WebsiteEventData } from 'lib/types';

export async function getEventDataProperties(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { propertyName: 'data_key' },
  });

  return rawQuery(
    `
    select
      website_event.event_name as "eventName",
      event_data.data_key as "propertyName",
      count(*) as "total"
    from event_data 
    join website_event on website_event.event_id = event_data.website_event_id
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by website_event.event_name, event_data.data_key
    order by 3 desc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ eventName: string; propertyName: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, filters, {
    columns: { propertyName: 'data_key' },
  });

  return rawQuery(
    `
    select
      event_name as eventName,
      data_key as propertyName,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    group by event_name, data_key
    order by 1, 3 desc
    limit 500
    `,
    params,
  );
}
