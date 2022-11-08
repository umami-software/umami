import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function createSession(...args) {
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

async function relationalQuery(websiteId, data) {
  return prisma.client.session.create({
    data: {
      websiteId,
      ...data,
    },
    select: {
      id: true,
      hostname: true,
      browser: true,
      os: true,
      screen: true,
      language: true,
      country: true,
      device: true,
    },
  });
}

async function clickhouseQuery(
  websiteId,
  { sessionId, hostname, browser, os, screen, language, country, device },
) {
  const { getDateFormat, sendMessage } = kafka;
  const website = await redis.get(`website:${websiteId}`);

  const data = {
    sessionId,
    website_id: websiteId,
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country: country ? country : null,
  };

  await sendMessage(data, 'event');

  return data;
}
