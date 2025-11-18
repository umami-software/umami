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
    select event_data.website_id as "websiteId",
       event_data.website_event_id as "eventId",
       website_event.event_name as "eventName",
       event_data.data_key as "dataKey",
       event_data.string_value as "stringValue",
       event_data.number_value as "numberValue",
       event_data.date_value as "dateValue",
       event_data.data_type as "dataType",
       event_data.created_at as "createdAt"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.website_event_id = {{eventId::uuid}}
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
        event_id as eventId,
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
