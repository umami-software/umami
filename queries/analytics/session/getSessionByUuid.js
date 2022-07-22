import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { rawQueryClickhouse, prisma, runAnalyticsQuery, runQuery } from 'lib/db';

export async function getSessionByUuid(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
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

  return rawQueryClickhouse(
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
