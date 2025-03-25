import { DATA_TYPE } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { flattenJSON, getStringValue } from '@/lib/data';
import prisma from '@/lib/prisma';
import { DynamicData } from '@/lib/types';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import kafka from '@/lib/kafka';
import clickhouse from '@/lib/clickhouse';

export async function saveSessionData(data: {
  websiteId: string;
  sessionId: string;
  sessionData: DynamicData;
  createdAt?: Date;
}) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
}

export async function relationalQuery(data: {
  websiteId: string;
  sessionId: string;
  sessionData: DynamicData;
  createdAt?: Date;
}) {
  const { client } = prisma;
  const { websiteId, sessionId, sessionData, createdAt } = data;

  const jsonKeys = flattenJSON(sessionData);

  const flattenedData = jsonKeys.map(a => ({
    id: uuid(),
    websiteId,
    sessionId,
    dataKey: a.key,
    stringValue: getStringValue(a.value, a.dataType),
    numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dataType,
    createdAt,
  }));

  const existing = await client.sessionData.findMany({
    where: {
      sessionId,
    },
    select: {
      id: true,
      sessionId: true,
      dataKey: true,
    },
  });

  for (const data of flattenedData) {
    const { sessionId, dataKey, ...props } = data;
    const record = existing.find(e => e.sessionId === sessionId && e.dataKey === dataKey);

    if (record) {
      await client.sessionData.update({
        where: {
          id: record.id,
        },
        data: {
          ...props,
        },
      });
    } else {
      await client.sessionData.create({
        data,
      });
    }
  }

  return flattenedData;
}

async function clickhouseQuery(data: {
  websiteId: string;
  sessionId: string;
  sessionData: DynamicData;
  createdAt?: Date;
}) {
  const { websiteId, sessionId, sessionData, createdAt } = data;

  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const jsonKeys = flattenJSON(sessionData);

  const messages = jsonKeys.map(({ key, value, dataType }) => {
    return {
      website_id: websiteId,
      session_id: sessionId,
      data_key: key,
      data_type: dataType,
      string_value: getStringValue(value, dataType),
      number_value: dataType === DATA_TYPE.number ? value : null,
      date_value: dataType === DATA_TYPE.date ? getUTCString(value) : null,
      created_at: getUTCString(createdAt),
    };
  });

  if (kafka.enabled) {
    await sendMessage('session_data', messages);
  } else {
    await insert('session_data', messages);
  }

  return data;
}
