import { EventData } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';

const FUNCTION_NAME = 'getEventData';

export async function getEventData(
  ...args: [websiteId: string, eventId: string]
): Promise<EventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, eventId: string) {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select website_id as "websiteId",
       session_id as "sessionId",
       event_id as "eventId",
       url_path as "urlPath",
       event_name as "eventName",
       data_key as "dataKey",
       string_value as "stringValue",
       number_value as "numberValue",
       date_value as "dateValue",
       data_type as "dataType",
       created_at as "createdAt"
    from event_data
    website_id = {{websiteId::uuid}}
      event_id = {{eventId::uuid}}
    `,
    { websiteId, eventId },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, eventId: string): Promise<EventData[]> {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
      select website_id as websiteId,
        session_id as sessionId,
        event_id as eventId,
        url_path as urlPath,
        event_name as eventName,
        data_key as dataKey,
        string_value as stringValue,
        number_value as numberValue,
        date_value as dateValue,
        data_type as dataType,
        created_at as createdAt
      from event_data
      where website_id = {websiteId:UUID} 
        and event_id = {eventId:UUID}
    `,
    { websiteId, eventId },
    FUNCTION_NAME,
  );
}
