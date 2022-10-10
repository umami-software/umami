import { EVENT_NAME_LENGTH, URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';

export async function saveEvent(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, { sessionId, url, eventName, eventData }) {
  const data = {
    websiteId,
    sessionId,
    url: url?.substring(0, URL_LENGTH),
    eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
  };

  if (eventData) {
    data.eventData = {
      create: {
        eventData: eventData,
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
    session_uuid: sessionUuid,
    event_uuid: eventUuid,
    website_id: websiteId,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    event_name: eventName?.substring(0, EVENT_NAME_LENGTH),
    event_data: JSON.stringify(eventData),
    ...sessionArgs,
    country: country ? country : null,
  };

  await sendMessage(params, 'event');
}
