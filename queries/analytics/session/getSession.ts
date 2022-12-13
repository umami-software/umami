import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';

export async function getSession(args: { id: string }) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(where: Prisma.SessionWhereUniqueInput) {
  return prisma.client.session.findUnique({
    where,
  });
}

async function clickhouseQuery({ id: sessionId }: { id: string }) {
  const { rawQuery, findFirst } = clickhouse;
  const params = [sessionId];

  return rawQuery(
    `select
      session_id, 
      website_id, 
      created_at, 
      hostname, 
      browser, 
      os, 
      device, 
      screen,
      language, 
      country 
    from event
      where session_id = $1
    limit 1`,
    params,
  ).then(result => findFirst(result));
}
