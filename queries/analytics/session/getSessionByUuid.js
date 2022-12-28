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

async function relationalQuery(sessionUuid) {
  return prisma.client.session
    .findUnique({
      where: {
        sessionUuid,
      },
    })
    .then(async res => {
      if (redis.enabled && res) {
        await redis.set(`session:${res.sessionUuid}`, 1);
      }

      return res;
    });
}

async function clickhouseQuery(sessionUuid) {
  const { rawQuery, findFirst } = clickhouse;
  const params = [sessionUuid];

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
  )
    .then(result => findFirst(result))
    .then(async res => {
      if (redis.enabled && res) {
        await redis.set(`session:${res.session_uuid}`, 1);
      }

      return res;
    });
}
