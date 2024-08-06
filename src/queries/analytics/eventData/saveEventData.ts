import { Prisma } from '@prisma/client';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenDynamicData, flattenJSON, getStringValue } from 'lib/data';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { DynamicData } from 'lib/types';

export async function saveEventData(data: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
  visitId?: string;
  urlPath?: string;
  eventName?: string;
  eventData: DynamicData;
  createdAt?: string;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
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
    dataKey: a.key,
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
  visitId?: string;
  urlPath?: string;
  eventName?: string;
  eventData: DynamicData;
  createdAt?: string;
}) {
  const { websiteId, sessionId, visitId, eventId, urlPath, eventName, eventData, createdAt } = data;

  const { getDateFormat, sendMessages, sendMessage } = kafka;

  const jsonKeys = flattenJSON(eventData);

  const messages = jsonKeys.map(({ key, value, dataType }) => {
    return {
      website_id: websiteId,
      session_id: sessionId,
      event_id: eventId,
      visitId: visitId,
      url_path: urlPath,
      event_name: eventName,
      data_key: key,
      data_type: dataType,
      string_value: getStringValue(value, dataType),
      number_value: dataType === DATA_TYPE.number ? value : null,
      date_value: dataType === DATA_TYPE.date ? getDateFormat(value) : null,
      created_at: createdAt ?? getDateFormat(new Date()),
    };
  });

  await sendMessages(messages, 'event_data');

  const jsonBlobs = flattenDynamicData(jsonKeys);
  const message: { [key: string]: string | number } = {
    website_id: websiteId,
    session_id: sessionId,
    event_id: eventId,
    visitId: visitId,
    event_name: eventName,
  };
  jsonBlobs.blobs.forEach((blob, i) => {
    message[`blob${i + 1}`] = blob;
  });
  jsonBlobs.doubles.forEach((double, i) => {
    message[`double${i + 1}`] = double;
  });

  await sendMessage(message, 'event_data_blob');

  return data;
}
