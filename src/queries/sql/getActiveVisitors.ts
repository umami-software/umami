import { subMinutes } from 'date-fns';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getActiveVisitors';

export async function getActiveVisitors(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { rawQuery } = prisma;
  const startDate = subMinutes(new Date(), 5);

  const result = await rawQuery(
    `
    select count(distinct session_id) as "visitors"
    from website_event
    where website_id = {{websiteId::uuid}}
    and created_at >= {{startDate}}
    `,
    { websiteId, startDate },
    FUNCTION_NAME,
  );

  return result?.[0] ?? null;
}

async function clickhouseQuery(websiteId: string): Promise<{ x: number }> {
  const { rawQuery } = clickhouse;
  const startDate = subMinutes(new Date(), 5);

  const result = await rawQuery(
    `
    select
      count(distinct session_id) as "visitors"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
    `,
    { websiteId, startDate },
    FUNCTION_NAME,
  );

  return result[0] ?? null;
}

async function oceanbaseQuery(websiteId: string) {
  const { rawQuery } = oceanbase;
  const startDate = subMinutes(new Date(), 5);

  const result = await rawQuery(
    `
    SELECT COUNT(DISTINCT session_id) AS visitors
    FROM website_event
    WHERE website_id = ?
      AND created_at >= ?
    `,
    [websiteId, startDate],
    FUNCTION_NAME,
  );

  return result?.[0] ?? null;
}
