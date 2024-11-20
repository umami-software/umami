import { Prisma } from '@prisma/client';
import clickhouse from 'lib/clickhouse';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { flattenDynamicData, flattenJSON, getStringValue } from 'lib/data';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { DynamicData, JsonKeyDynamicData } from 'lib/types';

export async function saveEventData(data: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
  visitId?: string;
  urlPath?: string;
  eventName?: string;
  eventData?: DynamicData;
  eventBatchData?: Array<DynamicData>;
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
  eventData?: DynamicData;
  eventBatchData?: Array<DynamicData>;
}): Promise<Prisma.BatchPayload> {
  const { websiteId, eventId, eventData, eventBatchData } = data;

  let jsonKeys: Array<JsonKeyDynamicData> = [];
  if (eventData) {
    jsonKeys = flattenJSON(eventData);
  } else if (eventBatchData) {
    jsonKeys = eventBatchData.flatMap(d => flattenJSON(d));
  }

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
  eventData?: DynamicData;
  eventBatchData?: Array<DynamicData>;
  createdAt?: string;
}) {
  const {
    websiteId,
    sessionId,
    visitId,
    eventId,
    urlPath,
    eventName,
    eventData,
    eventBatchData,
    createdAt,
  } = data;

  const { sendMessages, sendMessage } = kafka;
  const { insert, getUTCString } = clickhouse;

  let jsonKeys: Array<JsonKeyDynamicData> = [];
  if (eventData) {
    jsonKeys = flattenJSON(eventData);
  } else if (eventBatchData) {
    jsonKeys = eventBatchData.flatMap(d => flattenJSON(d));
  }

  const messages = jsonKeys.map(({ key, value, dataType }) => {
    return {
      website_id: websiteId,
      session_id: sessionId,
      event_id: eventId,
      visit_id: visitId,
      url_path: urlPath,
      event_name: eventName,
      data_key: key,
      data_type: dataType,
      string_value: getStringValue(value, dataType),
      number_value: dataType === DATA_TYPE.number ? value : null,
      date_value: dataType === DATA_TYPE.date ? getUTCString(value) : null,
      created_at: createdAt ?? getUTCString(),
    };
  });

  if (kafka.enabled) {
    await sendMessages('event_data', messages);
  } else {
    await insert('event_data', messages);
  }

  const jsonBlobs = flattenDynamicData(jsonKeys);
  const message: { [key: string]: string | number } = {
    website_id: websiteId,
    session_id: sessionId,
    event_id: eventId,
    visit_id: visitId,
    event_name: eventName,
    created_at: createdAt ?? getUTCString(new Date()),
  };
  jsonBlobs.blobs.forEach((blob, i) => {
    if (i >= 20) return; // 20 is the max number of blobs
    message[`blob${i + 1}`] = blob;
  });
  jsonBlobs.doubles.forEach((double, i) => {
    if (i >= 20) return; // 20 is the max number of doubles
    message[`double${i + 1}`] = double;
  });

  if (kafka.enabled) {
    await sendMessage('event_data_blob', message);
  } else {
    await insert('event_data_blob', [message]);
  }

  return data;
}
