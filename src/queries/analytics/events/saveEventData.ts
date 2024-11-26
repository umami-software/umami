import { Prisma } from '@prisma/client';
import clickhouse from 'lib/clickhouse';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { flattenDynamicData, flattenJSON, getStringValue } from 'lib/data';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { DynamicData, DynamicDataType } from 'lib/types';

export async function saveEventData(
  data: Array<{
    websiteId: string;
    eventId: string;
    sessionId?: string;
    visitId?: string;
    urlPath?: string;
    eventName?: string;
    eventData?: DynamicData;
    createdAt?: string;
  }>,
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
}

async function relationalQuery(
  data: Array<{
    websiteId: string;
    eventId: string;
    eventData?: DynamicData;
  }>,
): Promise<Prisma.BatchPayload> {
  const listFlattenedData: {
    id: string;
    websiteEventId: string;
    websiteId: string;
    dataKey: string;
    stringValue: string;
    numberValue: number;
    dateValue: Date;
    dataType: DynamicDataType;
  }[] = [];

  for (const item of data) {
    const { websiteId, eventId, eventData } = item;
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

    listFlattenedData.push(...flattenedData);
  }

  return prisma.client.eventData.createMany({
    data: listFlattenedData,
  });
}

async function clickhouseQuery(
  data: Array<{
    websiteId: string;
    eventId: string;
    sessionId?: string;
    visitId?: string;
    urlPath?: string;
    eventName?: string;
    eventData?: DynamicData;
    createdAt?: string;
  }>,
) {
  const { sendMessages } = kafka;
  const { insert, getUTCString } = clickhouse;

  const messagesEventData = [];
  const messagesEventDataBlob = [];

  for (const item of data) {
    const { websiteId, sessionId, visitId, eventId, urlPath, eventName, eventData, createdAt } =
      item;

    const jsonKeys = flattenJSON(eventData);

    const messagesPerEventData = jsonKeys.map(({ key, value, dataType }) => {
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

    messagesEventData.push(...messagesPerEventData);

    const jsonBlobs = flattenDynamicData(jsonKeys);
    const messageEventDataBlob: { [key: string]: string | number } = {
      website_id: websiteId,
      session_id: sessionId,
      event_id: eventId,
      visit_id: visitId,
      event_name: eventName,
      created_at: createdAt ?? getUTCString(new Date()),
    };
    jsonBlobs.blobs.forEach((blob, i) => {
      if (i >= 20) return; // 20 is the max number of blobs
      messageEventDataBlob[`blob${i + 1}`] = blob;
    });
    jsonBlobs.doubles.forEach((double, i) => {
      if (i >= 20) return; // 20 is the max number of doubles
      messageEventDataBlob[`double${i + 1}`] = double;
    });

    messagesEventDataBlob.push(messageEventDataBlob);
  }

  if (kafka.enabled) {
    await Promise.all([
      sendMessages('event_data', messagesEventData),
      sendMessages('event_data_blob', messagesEventDataBlob),
    ]);
  } else {
    await Promise.all([
      insert('event_data', messagesEventData),
      insert('event_data_blob', messagesEventDataBlob),
    ]);
  }

  return data;
}
