import { Prisma } from '@prisma/client';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenJSON, getStringValue } from 'lib/data';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { DynamicData } from 'lib/types';

export async function saveEventData(args: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
  urlPath?: string;
  eventName?: string;
  eventData: DynamicData;
  createdAt?: string;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: {
  websiteId: string;
  eventId: string;
  eventData: DynamicData;
}): Promise<Prisma.BatchPayload> {
  const { websiteId, eventId, eventData } = data;

  const jsonKeys = flattenJSON(eventData);

  // id, websiteEventId, eventStringValue
  const flattenedData = jsonKeys.map(a => ({
    id: uuid(),
    websiteEventId: eventId,
    websiteId,
    eventKey: a.key,
    stringValue: getStringValue(a.value, a.dataType),
    numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dataType,
  }));

  return prisma.client.eventData.createMany({
    data: flattenedData,
  });
}

async function clickhouseQuery(data: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
  urlPath?: string;
  eventName?: string;
  eventData: DynamicData;
  createdAt?: string;
}) {
  const { websiteId, sessionId, eventId, urlPath, eventName, eventData, createdAt } = data;

  const { getDateFormat, sendMessages } = kafka;

  const jsonKeys = flattenJSON(eventData);

  const messages = jsonKeys.map(a => ({
    website_id: websiteId,
    session_id: sessionId,
    event_id: eventId,
    url_path: urlPath,
    event_name: eventName,
    event_key: a.key,
    string_value: getStringValue(a.value, a.dataType),
    number_value: a.dataType === DATA_TYPE.number ? a.value : null,
    date_value: a.dataType === DATA_TYPE.date ? getDateFormat(a.value) : null,
    data_type: a.dataType,
    created_at: createdAt,
  }));

  await sendMessages(messages, 'event_data');

  return data;
}
