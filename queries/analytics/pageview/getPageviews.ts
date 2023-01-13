import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';

export async function getPageviews(...args: [websites: string[], startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites: string[], startAt: Date) {
  return prisma.client.pageview.findMany({
    where: {
      websiteId: {
        in: websites,
      },
      createdAt: {
        gte: startAt,
      },
    },
  });
}

async function clickhouseQuery(websites: string[], startAt: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `select
        website_id,
        session_id,
        created_at,
        url
      from event
      where event_type = ${EVENT_TYPE.pageView}
        and ${websites && websites.length > 0 ? `website_id in {websites:Array(UUID)}` : '0 = 0'}
        and created_at >= {startAt:DateTime('UTC')}`,
    {
      websites,
      startAt,
    },
  );
}
