import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';

export function getEvents(...args: [websiteId: string, startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websiteId: string, startAt: Date) {
  return prisma.client.websiteEvent.findMany({
    where: {
      websiteId,
      createdAt: {
        gte: startAt,
      },
    },
  });
}

function clickhouseQuery(websiteId: string, startAt: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `select
      event_id,
      website_id, 
      session_id,
      created_at,
      url,
      event_name
    from event
    where event_type = ${EVENT_TYPE.customEvent}
      and website_id = {websiteId:UUID}
      and created_at >= {startAt:DateTime('UTC')}`,
    {
      websiteId,
      startAt,
    },
  );
}
