import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { prisma, runQuery } from 'lib/db/relational';
import clickhouse from 'lib/clickhouse';
import { runAnalyticsQuery } from 'lib/db/db';

export async function getSessionByUuid(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(session_uuid) {
  return runQuery(
    prisma.session.findUnique({
      where: {
        session_uuid,
      },
    }),
  );
}

async function clickhouseQuery(session_uuid) {
  const params = [session_uuid];

  return clickhouse.rawQuery(
    `
    select 
      session_uuid, 
      website_id, 
      created_at, 
      hostname, 
      browser, 
      os, 
      device, 
      screen,
      "language", 
      country 
    from session
    where session_uuid = $1
    `,
    params,
  );
}
