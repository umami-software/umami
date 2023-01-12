import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';

export function getEvents(...args: [websites: string[], startAt: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websites: string[], startAt: Date) {
  return prisma.client.event.findMany({
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

function clickhouseQuery(websites: string[], startAt: Date) {
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
      and ${websites && websites.length > 0 ? `website_id in {websites:Array(UUID)}` : '0 = 0'}
      and created_at >= {startAt:DateTime('UTC')}`,
    {
      websites,
      startAt,
    },
  );
}
