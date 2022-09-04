import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function getSessionByUuid(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(session_uuid) {
  return prisma.client.session
    .findUnique({
      where: {
        session_uuid,
      },
    })
    .then(async res => {
      if (redis.client && res) {
        await redis.client.set(`session:${res.session_uuid}`, 1);
      }

      return res;
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
  )
    .then(result => findFirst(result))
    .then(async res => {
      if (redis.client && res) {
        await redis.client.set(`session:${res.session_uuid}`, 1);
      }

      return res;
    });
}
