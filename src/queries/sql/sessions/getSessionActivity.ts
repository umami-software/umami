import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export async function getSessionActivity(
  ...args: [websiteId: string, sessionId: string, startDate: Date, endDate: Date]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  sessionId: string,
  startDate: Date,
  endDate: Date,
) {
  return prisma.client.websiteEvent.findMany({
    where: {
      sessionId,
      websiteId,
      createdAt: { gte: startDate, lte: endDate },
    },
    take: 500,
    orderBy: { createdAt: 'desc' },
  });
}

async function clickhouseQuery(
  websiteId: string,
  sessionId: string,
  startDate: Date,
  endDate: Date,
) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select
      created_at as createdAt,
      url_path as urlPath,
      url_query as urlQuery,
      referrer_domain as referrerDomain,
      event_id as eventId,
      event_type as eventType,
      event_name as eventName,
      visit_id as visitId
    from website_event
    where website_id = {websiteId:UUID}
      and session_id = {sessionId:UUID} 
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    order by created_at desc
    limit 500
    `,
    { websiteId, sessionId, startDate, endDate },
  );
}
