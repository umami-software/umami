import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function getSession(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  }).then(async data => {
    if (redis.enabled && data) {
      await redis.set(`session:${data.id}`, data);
    }

    return data;
  });
}

async function relationalQuery(where) {
  return prisma.client.session.findUnique({
    where,
  });
}

async function clickhouseQuery(sessionId) {
  const { rawQuery, findFirst } = clickhouse;
  const params = [sessionId];

  return rawQuery(
    `select distinct
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
    where session_id = $1`,
    params,
  ).then(result => findFirst(result));
}
