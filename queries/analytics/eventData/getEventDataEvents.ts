import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { WebsiteEventDataFields } from 'lib/types';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export async function getEventDataEvents(
  ...args: [
    websiteId: string,
    startDate: Date,
    endDate: Date,
    filters: { field?: string; event?: string },
  ]
): Promise<WebsiteEventDataFields[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  startDate: Date,
  endDate: Date,
  filters: { field?: string; event?: string },
) {
  const { rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const { event } = filters;

  if (event) {
    return rawQuery(
      `
      select
        we.event_name as event,
        ed.event_key as field,
        ed.data_type as type,
        ed.string_value as value,
        count(*) as total
      from event_data as ed
      inner join website_event as we
        on we.event_id = ed.website_event_id
      where ed.website_id = {{websiteId::uuid}}
        and ed.created_at between {{startDate}} and {{endDate}}
        and we.event_name = {{event}}
      group by we.event_name, ed.event_key, ed.data_type, ed.string_value
      order by 1 asc, 2 asc, 3 asc, 4 desc
      `,
      { websiteId, startDate: maxDate(startDate, website.resetAt), endDate, ...filters },
    );
  }
  return rawQuery(
    `
    select
      we.event_name as event,
      ed.event_key as field,
      ed.data_type as type,
      count(*) as total
    from event_data as ed
    inner join website_event as we
      on we.event_id = ed.website_event_id
    where ed.website_id = {{websiteId::uuid}}
      and ed.created_at between {{startDate}} and {{endDate}}
    group by we.event_name, ed.event_key, ed.data_type
    order by 1 asc, 2 asc
    limit 100
    `,
    { websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
  );
}

async function clickhouseQuery(
  websiteId: string,
  startDate: Date,
  endDate: Date,
  filters: { field?: string; event?: string },
) {
  const { rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const { event } = filters;

  if (event) {
    return rawQuery(
      `
      select
        event_name as event,
        event_key as field,
        data_type as type,
        string_value as value,
        count(*) as total
      from event_data
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime} and {endDate:DateTime}
        and event_name = {event:String}
      group by event_key, data_type, string_value, event_name
      order by 1 asc, 2 asc, 3 asc, 4 desc
      limit 100
      `,
      { ...filters, websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
    );
  }

  return rawQuery(
    `
    select
      event_name as event,
      event_key as field,
      data_type as type,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
    group by event_key, data_type, event_name
    order by 1 asc, 2 asc
    limit 100
    `,
    { websiteId, startDate: maxDate(startDate, website.resetAt), endDate },
  );
}
