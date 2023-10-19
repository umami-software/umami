import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { DEFAULT_RESET_DATE } from 'lib/constants';

export async function getWebsiteDateRange(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { rawQuery, parseFilters } = prisma;
  const { params } = await parseFilters(websiteId, { startDate: new Date(DEFAULT_RESET_DATE) });

  const result = await rawQuery(
    `
    select
      min(created_at) as mindate,
      max(created_at) as maxdate
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at >= {{startDate}}
    `,
    params,
  );

  return result[0] ?? null;
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery, parseFilters } = clickhouse;
  const { params } = await parseFilters(websiteId, { startDate: new Date(DEFAULT_RESET_DATE) });

  const result = await rawQuery(
    `
    select
      min(created_at) as mindate,
      max(created_at) as maxdate
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
    `,
    params,
  );

  return result[0] ?? null;
}
