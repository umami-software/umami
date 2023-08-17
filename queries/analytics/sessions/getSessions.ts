import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getSessions(...args: [websiteId: string, startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startDate: Date) {
  return prisma.client.session.findMany({
    where: {
      websiteId,
      createdAt: {
        gte: startDate,
      },
    },
  });
}

async function clickhouseQuery(websiteId: string, startDate: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select distinct
      session_id as id,
      website_id as websiteId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      subdivision2,
      city
    from website_event
    where website_id = {websiteId:UUID}
    and created_at >= {startDate:DateTime}
    `,
    {
      websiteId,
      startDate,
    },
  );
}
