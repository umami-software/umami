import { EVENT_NAME_LENGTH, URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import cache from 'lib/cache';
import { UmamiApi } from 'lib/enum';

export async function saveEvent(args: {
  id: string;
  websiteId: string;
  url: string;
  referrer?: string;
  eventName?: string;
  eventData?: any;
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
  eventName?: string;
  eventData?: any;
}) {
  const { websiteId, id: sessionId, url, eventName, eventData, referrer } = data;

  const params = {
    id: uuid(),
    websiteId,
    sessionId,
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
    eventType: UmamiApi.EventType.Event,
    eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
    eventData,
  };

  return prisma.client.websiteEvent.create({
    data: params,
  });
}

async function clickhouseQuery(data: {
  id: string;
  websiteId: string;
  url: string;
  referrer?: string;
  eventName?: string;
  eventData?: any;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
}) {
  const { websiteId, id: sessionId, url, eventName, eventData, country, ...args } = data;
  const { getDateFormat, sendMessage } = kafka;
  const website = await cache.fetchWebsite(websiteId);

  const params = {
    website_id: websiteId,
    session_id: sessionId,
    event_id: uuid(),
    url: url?.substring(0, URL_LENGTH),
    event_name: eventName?.substring(0, EVENT_NAME_LENGTH),
    event_data: eventData ? JSON.stringify(eventData) : null,
    rev_id: website?.revId || 0,
    created_at: getDateFormat(new Date()),
    country: country ? country : null,
    ...args,
  };

  await sendMessage(params, 'event');

  return data;
}
