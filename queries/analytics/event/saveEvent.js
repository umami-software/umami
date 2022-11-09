import { EVENT_NAME_LENGTH, URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import cache from 'lib/cache';

export async function saveEvent(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(data) {
  const { websiteId, sessionId, url, eventName, eventData } = data;
  const eventId = uuid();

  const params = {
    id: eventId,
    websiteId,
    sessionId,
    url: url?.substring(0, URL_LENGTH),
    eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
  };

  if (eventData) {
    params.eventData = {
      create: {
        id: eventId,
        eventData: eventData,
      },
    };
  }

  return prisma.client.event.create({
    data: params,
  });
}

async function clickhouseQuery(data) {
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
