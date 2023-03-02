import { EVENT_NAME_LENGTH, URL_LENGTH, EVENT_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import cache from 'lib/cache';

export async function saveEvent(args: {
  id: string;
  websiteId: string;
  url: string;
  referrer?: string;
  pageTitle?: string;
  eventName?: string;
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
  pageTitle?: string;
  eventName?: string;
}) {
  const { websiteId, id: sessionId, url, eventName, referrer, pageTitle } = data;

  return prisma.client.websiteEvent.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      url: url?.substring(0, URL_LENGTH),
      referrer: referrer?.substring(0, URL_LENGTH),
      pageTitle: pageTitle,
      eventType: EVENT_TYPE.customEvent,
      eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
    },
  });
}

async function clickhouseQuery(data) {
  const {
    websiteId,
    id: sessionId,
    url,
    pageTitle,
    eventName,
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
    event_id: uuid(),
    country: country ? country : null,
    subdivision1: subdivision1 ? subdivision1 : null,
    subdivision2: subdivision2 ? subdivision2 : null,
    city: city ? city : null,
    url: url?.substring(0, URL_LENGTH),
    page_title: pageTitle,
    event_type: EVENT_TYPE.customEvent,
    event_name: eventName?.substring(0, EVENT_NAME_LENGTH),
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
    ...args,
  };

  await sendMessage(message, 'event');

  return data;
}
