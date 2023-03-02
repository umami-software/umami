import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { Prisma } from '@prisma/client';

export async function createSession(args: Prisma.SessionCreateInput) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  }).then(async data => {
    if (cache.enabled) {
      await cache.storeSession(data);
    }

    return data;
  });
}

async function relationalQuery(data: Prisma.SessionCreateInput) {
  return prisma.client.session.create({ data });
}

async function clickhouseQuery(data: {
  id: string;
  websiteId: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  subdivision1?: string;
  subdivision2?: string;
  city?: string;
}) {
  const {
    id,
    websiteId,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    subdivision1,
    subdivision2,
    city,
  } = data;
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
    subdivision1,
    subdivision2,
    city,
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
  };

  await sendMessage(msg, 'event');

  return data;
}
