import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function createSession(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  }).then(async data => {
    if (cache.enabled) {
      await cache.storeSession(data);
    }

    return data;
  });
}

async function relationalQuery(data) {
  return prisma.client.session.create({ data });
}

async function clickhouseQuery(data) {
  const { id, websiteId, hostname, browser, os, device, screen, language, country } = data;
  const { getDateFormat, sendMessage } = kafka;
  const website = await cache.fetchWebsite(websiteId);

  const msg = {
    session_id: id,
    website_id: websiteId,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
  };

  await sendMessage(msg, 'event');

  return data;
}
