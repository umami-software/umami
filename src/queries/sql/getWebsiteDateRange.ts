import clickhouse from '@/lib/clickhouse';
import { DEFAULT_RESET_DATE } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';

export async function getWebsiteDateRange(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
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

async function oceanbaseQuery(websiteId: string) {
  const { rawQuery, parseFilters } = oceanbase;
  const startDate = new Date(DEFAULT_RESET_DATE);
  const { buildParams } = parseFilters({
    startDate,
    websiteId,
  });

  const params = buildParams([websiteId, startDate]);

  const result = await rawQuery(
    `
    SELECT
      MIN(created_at) AS startDate,
      MAX(created_at) AS endDate
    FROM website_event
    WHERE website_id = ?
      AND created_at >= ?
    `,
    params,
  );

  return result[0] ?? null;
}
