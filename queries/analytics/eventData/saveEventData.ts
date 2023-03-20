import { EVENT_DATA_TYPE } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { flattenJSON } from 'lib/eventData';
import kafka from 'lib/kafka';
import { EventData } from 'lib/types';

export async function saveEventData(args: {
  websiteId: string;
  sessionId: string;
  eventId: string;
  revId: number;
  eventName: string;
  eventData: EventData;
  createdAt: string;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: {
  websiteId: string;
  sessionId: string;
  eventId: string;
  revId: number;
  eventName: string;
  eventData: EventData;
  createdAt: string;
}) {
  return data;
}

async function clickhouseQuery(data: {
  websiteId: string;
  sessionId: string;
  eventId: string;
  revId: number;
  eventName: string;
  eventData: EventData;
  createdAt: string;
}) {
  const { websiteId, sessionId, eventId, revId, eventName, eventData, createdAt } = data;

  const { getDateFormat, sendMessages } = kafka;

  const jsonKeys = flattenJSON(eventData);

  const messages = jsonKeys.map(a => ({
    website_id: websiteId,
    session_id: sessionId,
    event_id: eventId,
    rev_id: revId,
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
