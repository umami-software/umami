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

async function relationalQuery(website_id, { session_id, url, event_name, event_data }) {
  const data = {
    website_id,
    session_id,
    url: url?.substring(0, URL_LENGTH),
    event_name: event_name?.substring(0, EVENT_NAME_LENGTH),
  };

  if (event_data) {
    data.event_data = {
      create: {
        event_data: event_data,
      },
    };
  }

  return prisma.client.event.create({
    data,
  });
}

async function clickhouseQuery(
  website_id,
  { event_uuid, session_uuid, url, event_name, event_data },
) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    event_uuid,
    website_id,
    session_uuid,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    event_name: event_name?.substring(0, EVENT_NAME_LENGTH),
    event_data: JSON.stringify(event_data),
  };

  await sendMessage(params, 'event');
}
