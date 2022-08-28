import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getSessionByUuid(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(session_uuid) {
  return prisma.client.session.findUnique({
    where: {
      session_uuid,
    },
  });
}

async function clickhouseQuery(session_uuid) {
  const { rawQuery, findFirst } = clickhouse;
  const params = [session_uuid];

  return rawQuery(
    `select 
      session_uuid, 
      website_id, 
      created_at, 
      hostname, 
      browser, 
      os, 
      device, 
      screen,
      language, 
      country 
    from session
    where session_uuid = $1`,
    params,
  ).then(result => findFirst(result));
}
