import { URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { uuid } from 'lib/crypto';
import { UmamiApi } from 'lib/constants';

export async function savePageView(args: {
  id: string;
  websiteId: string;
  url: string;
  referrer?: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: {
  id: string;
  websiteId: string;
  url: string;
  referrer?: string;
}) {
  const { websiteId, id: sessionId, url, referrer } = data;

  return prisma.client.websiteEvent.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
      eventType: UmamiApi.EventType.Pageview,
    },
  });
}

async function clickhouseQuery(data) {
  const { websiteId, id: sessionId, url, referrer, country, ...args } = data;
  const website = await cache.fetchWebsite(websiteId);
  const { getDateFormat, sendMessage } = kafka;

  const msg = {
    session_id: sessionId,
    website_id: websiteId,
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
    country: country ? country : null,
    ...args,
  };

  await sendMessage(msg, 'event');

  return data;
}
