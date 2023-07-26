import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { loadWebsite } from 'lib/load';
import { DEFAULT_RESET_DATE } from 'lib/constants';
import { maxDate } from 'lib/date';

export async function getWebsiteDateRange(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { rawQuery } = prisma;
  const website = await loadWebsite(websiteId);

  return rawQuery(
    `
    select
      min(created_at) as min,
      max(created_at) as max
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at >= {{startDate}}
    `,
    { websiteId, startDate: maxDate(new Date(DEFAULT_RESET_DATE), new Date(website.resetAt)) },
  );
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);

  return rawQuery(
    `
    select
      min(created_at) as min,
      max(created_at) as max
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime}
    `,
    { websiteId, startDate: maxDate(new Date(DEFAULT_RESET_DATE), new Date(website.resetAt)) },
  );
}
