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

async function relationalQuery(websiteId, data) {
  return prisma.client.session
    .create({
      data: {
        websiteId,
        ...data,
      },
      select: {
        sessionId: true,
        sessionUuid: true,
        hostname: true,
        browser: true,
        os: true,
        screen: true,
        language: true,
        country: true,
        device: true,
      },
    })
    .then(async res => {
      if (redis.client && res) {
        await redis.client.set(`session:${res.sessionUuid}`, res.id);
      }

      return res;
    });
}

async function clickhouseQuery(
  websiteId,
  { sessionUuid, hostname, browser, os, screen, language, country, device },
) {
  const { getDateFormat, sendMessage } = kafka;

  const params = {
    session_uuid: sessionUuid,
    website_id: websiteId,
    created_at: getDateFormat(new Date()),
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country: country ? country : null,
  };

  await sendMessage(params, 'event');

  if (redis.client) {
    await redis.client.set(`session:${sessionUuid}`, 1);
  }
}
