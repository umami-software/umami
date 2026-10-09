import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE, FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { flattenJSON, getStoredStringValue } from '@/lib/data';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';
import type { DynamicData } from '@/lib/types';

export interface SaveSessionDataArgs {
  websiteId: string;
  sessionId: string;
  sessionData: DynamicData;
  distinctId?: string;
  createdAt?: Date;
}

export async function saveSessionData(data: SaveSessionDataArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
}

export async function relationalQuery({
  websiteId,
  sessionId,
  sessionData,
  distinctId,
  createdAt,
}: SaveSessionDataArgs) {
  const { writeRawQuery } = prisma;

  const jsonKeys = flattenJSON(sessionData);
  const normalizedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);

  const flattenedData = jsonKeys.map(a => ({
    id: uuid(),
    websiteId,
    sessionId,
    dataKey: truncateString(a.key, FIELD_LENGTH.dataKey),
    stringValue: getStoredStringValue(a.value, a.dataType),
    numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dataType,
    distinctId: normalizedDistinctId,
    createdAt,
  }));

  for (const data of flattenedData) {
    const {
      id,
      websiteId,
      sessionId,
      dataKey,
      stringValue,
      numberValue,
      dateValue,
      dataType,
      distinctId,
      createdAt,
    } = data;

    await writeRawQuery(
      `
      insert into session_data (
        session_data_id,
        website_id,
        session_id,
        data_key,
        string_value,
        number_value,
        date_value,
        data_type,
        distinct_id,
        created_at
      )
      values (
        {{id}},
        {{websiteId}},
        {{sessionId}},
        {{dataKey}},
        {{stringValue}},
        {{numberValue}},
        {{dateValue}},
        {{dataType}},
        {{distinctId}},
        coalesce({{createdAt}}, now())
      )
      on conflict (session_id, data_key)
      do update set
        website_id = excluded.website_id,
        string_value = excluded.string_value,
        number_value = excluded.number_value,
        date_value = excluded.date_value,
        data_type = excluded.data_type,
        distinct_id = excluded.distinct_id,
        created_at = coalesce({{createdAt}}, session_data.created_at)
      `,
      {
        id,
        websiteId,
        sessionId,
        dataKey,
        stringValue,
        numberValue,
        dateValue,
        dataType,
        distinctId,
        createdAt,
      },
      'saveSessionData',
    );
  }
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  sessionData,
  distinctId,
  createdAt,
}: SaveSessionDataArgs) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const jsonKeys = flattenJSON(sessionData);
  const normalizedDistinctId = truncateString(distinctId, FIELD_LENGTH.distinctId);

  const messages = jsonKeys.map(({ key, value, dataType }) => {
    return {
      website_id: websiteId,
      session_id: sessionId,
      data_key: truncateString(key, FIELD_LENGTH.dataKey),
      data_type: dataType,
      string_value: getStoredStringValue(value, dataType),
      number_value: dataType === DATA_TYPE.number ? value : null,
      date_value: dataType === DATA_TYPE.date ? getUTCString(value) : null,
      distinct_id: normalizedDistinctId,
      created_at: getUTCString(createdAt),
    };
  });

  if (kafka.enabled) {
    await sendMessage('session_data', messages);
  } else {
    await insert('session_data', messages);
  }
}
