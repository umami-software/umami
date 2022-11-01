import { EVENT_NAME_LENGTH, URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';

export async function saveEvent(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId,
  { eventId, session: { id: sessionId }, eventUuid, url, eventName, eventData },
) {
  const data = {
    id: eventId,
    websiteId,
    sessionId,
    url: url?.substring(0, URL_LENGTH),
    eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
    eventUuid,
  };

  if (eventData) {
    data.eventData = {
      create: {
        eventData: eventData,
        id: uuid(),
      },
    };
  }

  return prisma.client.event.create({
    data,
  });
}

async function clickhouseQuery(
  websiteId,
  { session: { country, sessionUuid, ...sessionArgs }, eventUuid, url, eventName, eventData },
) {
  const { getDateFormat, sendMessage } = kafka;

  const params = {
    session_id: sessionUuid,
    event_id: eventUuid,
    website_id: websiteId,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    event_name: eventName?.substring(0, EVENT_NAME_LENGTH),
    event_data: eventData ? JSON.stringify(eventData) : null,
    ...sessionArgs,
    country: country ? country : null,
  };

  await sendMessage(params, 'event');
}
