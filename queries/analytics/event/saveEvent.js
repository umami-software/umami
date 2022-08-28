import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import kafka from 'lib/kafka';
import { runQuery, CLICKHOUSE, KAFKA, PRISMA } from 'lib/db';
import { URL_LENGTH, EVENT_NAME_LENGTH } from 'lib/constants';

export async function saveEvent(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [KAFKA]: () => kafkaQuery(...args),
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

async function clickhouseQuery(website_id, { event_uuid, session_uuid, url, event_name }) {
  const { rawQuery, getDateFormat } = clickhouse;
  const params = [
    website_id,
    event_uuid,
    session_uuid,
    url?.substring(0, URL_LENGTH),
    event_name?.substring(0, EVENT_NAME_LENGTH),
  ];

  return rawQuery(
    `insert into umami.event (created_at, website_id, session_uuid, url, event_name)
    values (${getDateFormat(new Date())},  $1, $2, $3, $4);`,
    params,
  );
}

async function kafkaQuery(website_id, { event_uuid, session_uuid, url, event_name }) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    event_uuid: event_uuid,
    website_id: website_id,
    session_uuid: session_uuid,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    event_name: event_name?.substring(0, EVENT_NAME_LENGTH),
  };

  await sendMessage(params, 'event');
}
