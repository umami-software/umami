import { DATA_TYPE } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { flattenJSON, getStringValue } from 'lib/data';
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

  const flattenedData = jsonKeys.map(a => ({
    id: uuid(),
    websiteId,
    sessionId,
    key: a.key,
    stringValue: getStringValue(a.value, a.dataType),
    numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
    dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
    dataType: a.dataType,
  }));

  return transaction([
    client.sessionData.deleteMany({
      where: {
        sessionId,
      },
    }),
    client.sessionData.createMany({
      data: flattenedData as any,
    }),
  ]);
}
