import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getWebsiteSession(...args: [sessionId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(sessionId: string) {
  return prisma.client.session.findUnique({
    where: {
      id: sessionId,
    },
  });
}

async function clickhouseQuery(sessionId: string) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select
      session_id as id,
      website_id as websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      city,
      min(created_at) as firstAt,
      max(created_at) as lastAt,
      uniq(visit_id) as visits,
      sumIf(1, event_type = 1) as views,
      sumIf(1, event_type = 2) as events
    from website_event
    where session_id = {sessionId:UUID}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, subdivision1, city
    `,
    { sessionId },
  ).then(result => result?.[0]);
}
