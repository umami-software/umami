import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { QueryFilters, WebsiteEventDataFields } from 'lib/types';

export async function getEventDataFields(
  ...args: [websiteId: string, filters: QueryFilters & { field?: string }]
): Promise<WebsiteEventDataFields[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters & { field?: string }) {
  const { rawQuery, parseFilters } = prisma;
  const { field } = filters;
  const { params } = await parseFilters(websiteId, filters);

  if (field) {
    return rawQuery(
      `
      select
        event_key as field,
        string_value as value,
        count(*) as total
      from event_data
      where website_id = {{websiteId::uuid}}
        and event_key = {{field}}
        and created_at between {{startDate}} and {{endDate}}
      group by event_key, string_value
      order by 3 desc, 2 desc, 1 asc
      limit 100
      `,
      params,
    );
  }

  return rawQuery(
    `
    select
      event_key as field,
      data_type as type,
      count(*) as total
    from event_data
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    group by event_key, data_type
    order by 3 desc, 2 asc, 1 asc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters & { field?: string }) {
  const { rawQuery, parseFilters } = clickhouse;
  const { field } = filters;
  const { params } = await parseFilters(websiteId, filters);

  if (field) {
    return rawQuery(
      `
      select
        event_key as field,
        string_value as value,
        count(*) as total
      from event_data
      where website_id = {websiteId:UUID}
        and event_key = {field:String}
        and created_at between {startDate:DateTime} and {endDate:DateTime}
      group by event_key, string_value
      order by 3 desc, 2 desc, 1 asc
      limit 100
      `,
      params,
    );
  }

  return rawQuery(
    `
    select
      event_key as field,
      data_type as type,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
    group by event_key, data_type
    order by 3 desc, 2 asc, 1 asc
    limit 100
    `,
    params,
  );
}
