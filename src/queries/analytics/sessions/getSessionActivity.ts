import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getSessionActivity(...args: [websiteId: string, sessionId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string) {
  return prisma.client.websiteEvent.findMany({
    where: {
      id: sessionId,
      websiteId,
    },
  });
}

async function clickhouseQuery(websiteId: string, sessionId: string) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select
      session_id as id,
      website_id as websiteId,
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
    order by created_at desc
    `,
    { websiteId, sessionId },
  );
}
