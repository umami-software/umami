import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';

export function getEvents(...args: [websiteId: string, startAt: Date, eventType: number]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websiteId: string, startAt: Date, eventType: number) {
  return prisma.client.websiteEvent.findMany({
    where: {
      websiteId,
      eventType,
      createdAt: {
        gte: startAt,
      },
    },
  });
}

function clickhouseQuery(websiteId: string, startAt: Date, eventType: number) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `select
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      url_path as urlPath,
      referrer_domain as referrerDomain,
      event_name as eventName
    from website_event
    where event_type = {eventType:UInt32}
      and website_id = {websiteId:UUID}
      and created_at >= {startAt:DateTime('UTC')}`,
    {
      websiteId,
      startAt,
      eventType,
    },
  );
}
