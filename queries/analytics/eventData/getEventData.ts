import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { WebsiteEventDataMetric } from 'lib/types';
import { loadWebsite } from 'lib/query';
import { DEFAULT_CREATED_AT } from 'lib/constants';
import prisma from '../../../lib/prisma';

export async function getEventData(
  ...args: [websiteId: string, startDate: Date, endDate: Date, field?: string]
): Promise<WebsiteEventDataMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startDate: Date, endDate: Date, field: string) {
  const { toUuid, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);

  if (field) {
    return rawQuery(
      `select event_key as field,
              count(*)  as total
       from event_data
       where website_id = $1${toUuid()}
          and event_key = $2
         and created_at >= $3
         and created_at between $4 and $5
       group by event_key
       order by 2 desc, 1 asc
           limit 1000
      `,
      [websiteId, field, resetDate, startDate, endDate] as any,
    );
  }

  return rawQuery(
    `select
        event_key as field,
        count(*) as total
        from event_data
        where website_id = $1${toUuid()}
          and created_at >= $2
          and created_at between $3 and $4
        group by event_key
        order by 2 desc, 1 asc
        limit 1000
    `,
    [websiteId, resetDate, startDate, endDate] as any,
  );
}

async function clickhouseQuery(websiteId: string, startDate: Date, endDate: Date, field: string) {
  const { rawQuery, getDateFormat, getBetweenDates } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);

  if (field) {
    return rawQuery(
      `select
        event_key as field,
        count(*) as total
        from event_data
        where website_id = {websiteId:UUID}
          and event_key = {field:String}
          and created_at >= ${getDateFormat(resetDate)}
          and ${getBetweenDates('created_at', startDate, endDate)}
        group by event_key
        order by 2 desc, 1 asc
        limit 1000
    `,
      { websiteId, field },
    );
  }

  return rawQuery(
    `select
        event_key as field,
        count(*) as total
        from event_data
        where website_id = {websiteId:UUID}
          and created_at >= ${getDateFormat(resetDate)}
          and ${getBetweenDates('created_at', startDate, endDate)}
        group by event_key
        order by 2 desc, 1 asc
        limit 1000
    `,
    { websiteId },
  );
}
