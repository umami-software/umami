import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function createSession(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, data) {
  return prisma.client.session
    .create({
      data: {
        website_id,
        ...data,
      },
      select: {
        session_id: true,
      },
    })
    .then(async res => {
      if (redis.client && res) {
        await redis.client.set(`session:${res.session_uuid}`, 1);
      }

      return res;
    });
}

async function clickhouseQuery(
  website_id,
  { session_uuid, hostname, browser, os, screen, language, country, device },
) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    session_uuid: session_uuid,
    website_id: website_id,
    created_at: getDateFormat(new Date()),
    hostname: hostname,
    browser: browser,
    os: os,
    device: device,
    screen: screen,
    language: language,
    country: country ? country : null,
  };

  await sendMessage(params, 'session');

  if (redis.client) {
    await redis.client.set(`session:${session_uuid}`, 1);
  }
}
