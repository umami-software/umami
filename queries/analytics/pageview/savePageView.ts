import { URL_LENGTH, EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { uuid } from 'lib/crypto';

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
  subdivision1?: string;
  subdivision2?: string;
  city?: string;
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
      eventType: EVENT_TYPE.pageView,
    },
  });
}

async function clickhouseQuery(data) {
  const {
    websiteId,
    id: sessionId,
    url,
    referrer,
    country,
    subdivision1,
    subdivision2,
    city,
    ...args
  } = data;
  const { getDateFormat, sendMessage } = kafka;
  const website = await cache.fetchWebsite(websiteId);

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    rev_id: website?.revId || 0,
    country: country ? country : null,
    subdivision1: subdivision1 ? subdivision1 : null,
    subdivision2: subdivision2 ? subdivision2 : null,
    city: city ? city : null,
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    event_type: EVENT_TYPE.pageView,
    created_at: getDateFormat(new Date()),
    ...args,
  };

  await sendMessage(message, 'event');

  return data;
}
