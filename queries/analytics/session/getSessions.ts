import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getSessions(...args: [websiteId: string, startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startAt: Date) {
  return prisma.client.session.findMany({
    where: {
      websiteId,
      createdAt: {
        gte: startAt,
      },
    },
  });
}

async function clickhouseQuery(websiteId: string, startAt: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `select distinct
      session_id,
      website_id,
      created_at,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country
    from event
    where website_id = {websiteId:UUID}
      and created_at >= {startAt:DateTime('UTC')}`,
    {
      websiteId,
      startAt,
    },
  );
}
