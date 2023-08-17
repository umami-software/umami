import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { WebsiteEventDataFields } from 'lib/types';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export async function getEventDataFields(
  ...args: [websiteId: string, startDate: Date, endDate: Date, field?: string]
): Promise<WebsiteEventDataFields[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startDate: Date, endDate: Date, field: string) {
  const { rawQuery } = prisma;
  const website = await loadWebsite(websiteId);

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
      { websiteId, field, startDate: maxDate(startDate, website.resetAt), endDate },
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
    { websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
  );
}

async function clickhouseQuery(websiteId: string, startDate: Date, endDate: Date, field: string) {
  const { rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);

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
      { websiteId, field, startDate: maxDate(startDate, website.resetAt), endDate },
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
    { websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
  );
}
