import { Prisma } from '@prisma/client';
import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenJSON, getStringValue } from 'lib/data';
import clickhouse from 'lib/clickhouse';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { DynamicData } from 'lib/types';

export async function saveEventData(data: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
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
  urlPath?: string;
  eventName?: string;
  eventData: DynamicData;
  createdAt?: string;
}) {
  const { websiteId, sessionId, eventId, urlPath, eventName, eventData, createdAt } = data;

  const { insert, getUTCString } = clickhouse;
  const { sendMessages } = kafka;

  const jsonKeys = flattenJSON(eventData);

  const messages = jsonKeys.map(({ key, value, dataType }) => {
    return {
      website_id: websiteId,
      session_id: sessionId,
      event_id: eventId,
      url_path: urlPath,
      event_name: eventName,
      data_key: key,
      data_type: dataType,
      string_value: getStringValue(value, dataType),
      number_value: dataType === DATA_TYPE.number ? value : null,
      date_value: dataType === DATA_TYPE.date ? getUTCString(value) : null,
      created_at: createdAt,
    };
  });

  if (kafka.enabled) {
    await sendMessages('event_data', messages);
  } else {
    await insert('event_data', messages);
  }

  return data;
}
