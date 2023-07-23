import { buildSql } from 'lib/sql';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { WebsiteEventDataFields } from 'lib/types';
import { loadWebsite } from 'lib/query';
import { DEFAULT_RESET_DATE } from 'lib/constants';

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
  const { toUuid, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const { field, event } = filters;

  if (field) {
    if (event) {
      return rawQuery(
        `select ed.event_key as field,
                ed.string_value as value,
                count(ed.*) as total
                from event_data as ed
         inner join website_event as we
           on we.event_id = ed.website_event_id
         where ed.website_id = $1${toUuid()}
           and ed.event_key = $2
           and ed.created_at >= $3
           and ed.created_at between $4 and $5
           and we.event_name = $6
         group by ed.event_key, ed.string_value
         order by 3 desc, 2 desc, 1 asc
        `,
        [websiteId, field, resetDate, startDate, endDate, event] as any,
      );
    }

    return rawQuery(
      `select event_key as field,
              string_value as value,
              count(*) as total
       from event_data
       where website_id = $1${toUuid()}
         and event_key = $2
         and created_at >= $3
         and created_at between $4 and $5
       group by event_key, string_value
       order by 3 desc, 2 desc, 1 asc
      `,
      [websiteId, field, resetDate, startDate, endDate] as any,
    );
  }
}

async function clickhouseQuery(
  websiteId: string,
  startDate: Date,
  endDate: Date,
  filters: { field?: string; event?: string },
) {
  const { rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const { event } = filters;

  if (event) {
    return rawQuery(
      `select
         event_name as event,
         event_key as field,
         data_type as type,
         string_value as value,
         count(*) as total
      from event_data
      where website_id = {websiteId:UUID}
        and created_at >= {resetDate:DateTime}
        and created_at between {startDate:DateTime} and {endDate:DateTime}
        and event_name = {event:String}
      group by event_key, data_type, string_value, event_name
      order by 1 asc, 2 asc, 3 asc, 4 desc
      limit 100`,
      { websiteId, resetDate, startDate, endDate, event },
    );
  }

  return rawQuery(
    `select
         event_name as event,
         event_key as field,
         data_type as type,
         count(*) as total
     from event_data
     where website_id = {websiteId:UUID}
       and created_at >= {resetDate:DateTime}
       and created_at between {startDate:DateTime} and {endDate:DateTime}
     group by event_key, data_type, event_name
     order by 1 asc, 2 asc
         limit 100
    `,
    { websiteId, resetDate, startDate, endDate },
  );
}
