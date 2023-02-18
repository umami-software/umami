import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';

export async function getPageviews(...args: [websiteId: string, startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, startAt: Date) {
  return prisma.client.websiteEvent.findMany({
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
    `select
        website_id as websiteId,
        session_id as sessionId,
        created_at as createdAt,
        toUnixTimestamp(created_at) as timestamp,
        url
      from event
      where event_type = ${EVENT_TYPE.pageView}
        and website_id = {websiteId:UUID}
        and created_at >= {startAt:DateTime('UTC')}`,
    {
      websiteId,
      startAt,
    },
  );
}
