import { Prisma } from '@prisma/client';
import { EVENT_DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenJSON } from 'lib/eventData';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { EventData } from 'lib/types';

export async function saveEventData(args: {
  websiteId: string;
  eventId: string;
  sessionId?: string;
  urlPath?: string;
  eventName?: string;
  eventData: EventData;
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
  eventData: EventData;
}): Promise<Prisma.BatchPayload> {
  const { websiteId, eventId, eventData } = data;

  const jsonKeys = flattenJSON(eventData);

  //id, websiteEventId, eventStringValue
  const flattendData = jsonKeys.map(a => ({
    id: uuid(),
    websiteEventId: eventId,
    websiteId,
    eventKey: a.key,
    eventStringValue:
      a.eventDataType === EVENT_DATA_TYPE.string ||
      a.eventDataType === EVENT_DATA_TYPE.boolean ||
      a.eventDataType === EVENT_DATA_TYPE.array
        ? a.value
        : null,
    eventNumericValue: a.eventDataType === EVENT_DATA_TYPE.number ? a.value : null,
    eventDateValue: a.eventDataType === EVENT_DATA_TYPE.date ? new Date(a.value) : null,
    eventDataType: a.eventDataType,
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
  eventData: EventData;
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
    event_string_value:
      a.eventDataType === EVENT_DATA_TYPE.string ||
      a.eventDataType === EVENT_DATA_TYPE.boolean ||
      a.eventDataType === EVENT_DATA_TYPE.array
        ? a.value
        : null,
    event_numeric_value: a.eventDataType === EVENT_DATA_TYPE.number ? a.value : null,
    event_date_value: a.eventDataType === EVENT_DATA_TYPE.date ? getDateFormat(a.value) : null,
    event_data_type: a.eventDataType,
    created_at: createdAt,
  }));

  await sendMessages(messages, 'event_data');

  return data;
}
