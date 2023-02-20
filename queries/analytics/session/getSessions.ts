import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getSessions(...args: [websites: string[], startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites: string[], startAt: Date) {
  return prisma.client.session.findMany({
    where: {
      ...(websites && websites.length > 0
        ? {
            websiteId: {
              in: websites,
            },
          }
        : {}),
      createdAt: {
        gte: startAt,
      },
    },
  });
}

async function clickhouseQuery(websites: string[], startAt: Date) {
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
      country,
      subdivision1,
      subdivision2,
      city
    from event
    where ${websites && websites.length > 0 ? `website_id in {websites:Array(UUID)}` : '0 = 0'}
      and created_at >= {startAt:DateTime('UTC')}`,
    {
      websites,
      startAt,
    },
  );
}
