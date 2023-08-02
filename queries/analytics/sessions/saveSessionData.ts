import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { flattenJSON } from 'lib/data';
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
      a.dynamicDataType === DATA_TYPE.number
        ? parseFloat(a.value).toFixed(4)
        : a.dynamicDataType === DATA_TYPE.date
        ? a.value.split('.')[0] + 'Z'
        : a.value.toString(),
    numberValue: a.dynamicDataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dynamicDataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dynamicDataType,
  }));

  return transaction([
    client.sessionData.deleteMany({
      where: {
        sessionId,
      },
    }),
    client.sessionData.createMany({
      data: flattendData as any,
    }),
  ]);
}
