import { subMinutes } from 'date-fns';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getActiveVisitors(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select count(distinct session_id) x
    from website_event
    where website_id = {{websiteId::uuid}}
    and created_at >= {{startAt}}
    `,
    { websiteId, startAt: subMinutes(new Date(), 5) },
  );
}

async function clickhouseQuery(websiteId: string): Promise<{ x: number }> {
  const { rawQuery } = clickhouse;

  const result = rawQuery(
    `
    select
      count(distinct session_id) x
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startAt:DateTime64}
    `,
    { websiteId, startAt: subMinutes(new Date(), 5) },
  ).then(a => {
    return Object.values(a).map(a => {
      return { x: Number(a.x) };
    });
  });

  return result[0] ?? null;
}
