import { Prisma } from '@prisma/client';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenJSON } from 'lib/data';
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
  const flattendData = jsonKeys.map(a => ({
    id: uuid(),
    websiteEventId: eventId,
    websiteId,
    eventKey: a.key,
    stringValue:
      a.dynamicDataType === DATA_TYPE.number
        ? parseFloat(a.value).toFixed(4)
        : a.dynamicDataType === DATA_TYPE.date
        ? a.value.split('.')[0] + 'Z'
        : a.value.toString(),
    numberValue: a.dynamicDataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dynamicDataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dynamicDataType,
  }));

  return prisma.client.eventData.createMany({
    data: flattendData,
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
    string_value:
      a.dynamicDataType === DATA_TYPE.date
        ? getDateFormat(a.value, 'isoUtcDateTime')
        : a.value.toString(),
    number_value: a.dynamicDataType === DATA_TYPE.number ? a.value : null,
    date_value: a.dynamicDataType === DATA_TYPE.date ? getDateFormat(a.value) : null,
    data_type: a.dynamicDataType,
    created_at: createdAt,
  }));

  await sendMessages(messages, 'event_data');

  return data;
}
