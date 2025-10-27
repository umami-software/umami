import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from '@/lib/db';
import { DEFAULT_RESET_DATE } from '@/lib/constants';

export async function getWebsiteDateRange(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { rawQuery, parseFilters } = prisma;
  const { queryParams } = parseFilters({
    startDate: new Date(DEFAULT_RESET_DATE),
    websiteId,
  });

  const result = await rawQuery(
    `
    select
      min(created_at) as "startDate",
      max(created_at) as "endDate"
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at >= {{startDate}}
    `,
    queryParams,
  );

  return result[0] ?? null;
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams } = parseFilters({
    startDate: new Date(DEFAULT_RESET_DATE),
    websiteId,
  });

  const result = await rawQuery(
    `
    select
      min(created_at) as startDate,
      max(created_at) as endDate
    from website_event_stats_hourly
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
    `,
    queryParams,
  );

  return result[0] ?? null;
}
