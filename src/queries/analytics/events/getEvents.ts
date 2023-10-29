import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export function getEvents(...args: [websiteId: string, startDate: Date, eventType: number]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websiteId: string, startDate: Date, eventType: number) {
  return prisma.client.websiteEvent.findMany({
    where: {
      websiteId,
      eventType,
      createdAt: {
        gte: startDate,
      },
    },
  });
}

function clickhouseQuery(websiteId: string, startDate: Date, eventType: number) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      url_path as urlPath,
      referrer_domain as referrerDomain,
      event_name as eventName
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
      and event_type = {eventType:UInt32}
    `,
    {
      websiteId,
      startDate,
      eventType,
    },
  );
}
