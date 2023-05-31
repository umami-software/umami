import { DYNAMIC_DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { flattenJSON } from 'lib/dynamicData';
import prisma from 'lib/prisma';
import { DynamicData } from 'lib/types';

export async function saveSessionData(data: {
  websiteId: string;
  sessionId: string;
  sessionData: DynamicData;
}) {
  const { client, transaction } = prisma;
  const { websiteId, sessionId, sessionData } = data;

  const jsonKeys = flattenJSON(sessionData);

  const flattendData = jsonKeys.map(a => ({
    id: uuid(),
    websiteId,
    sessionId,
    key: a.key,
    stringValue:
      a.dynamicDataType === DYNAMIC_DATA_TYPE.string ||
      a.dynamicDataType === DYNAMIC_DATA_TYPE.boolean ||
      a.dynamicDataType === DYNAMIC_DATA_TYPE.array
        ? a.value
        : null,
    numericValue: a.dynamicDataType === DYNAMIC_DATA_TYPE.number ? a.value : null,
    dateValue: a.dynamicDataType === DYNAMIC_DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dynamicDataType,
  }));

  return transaction([
    client.sessionData.deleteMany({
      where: {
        sessionId,
      },
    }),
    client.sessionData.createMany({
      data: flattendData,
    }),
  ]);
}
