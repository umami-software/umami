import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { WebsiteEventDataMetric } from 'lib/types';
import { loadWebsite } from 'lib/query';
import { DEFAULT_CREATED_AT } from 'lib/constants';

export async function getEventDataFields(
  ...args: [websiteId: string, startDate: Date, endDate: Date]
): Promise<WebsiteEventDataMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startDate: Date, endDate: Date) {
  const { toUuid, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const params: any = [websiteId, resetDate, startDate, endDate];

  return rawQuery(
    `select
        distinct event_key as eventKey, data_type as eventDataType
    from event_data
    where website_id = $1${toUuid()}
      and created_at >= $2
      and created_at between $3 and $4`,
    params,
  );
}

async function clickhouseQuery(websiteId: string, startDate: Date, endDate: Date) {
  const { rawQuery, getDateFormat, getBetweenDates } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const params = { websiteId };

  return rawQuery(
    `select
        distinct event_key as eventKey, data_type as eventDataType
    from event_data
    where website_id = {websiteId:UUID}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}`,
    params,
  );
}
