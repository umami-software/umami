import { Prisma, Website } from '@prisma/client';
import cache from 'lib/cache';
import prisma from 'lib/prisma';
import { getWebsite } from 'queries';

export async function resetWebsite(
  websiteId,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;

  const { revId } = await getWebsite({ id: websiteId });

  return transaction([
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.website.update({ where: { id: websiteId }, data: { revId: revId + 1 } }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.storeWebsite(data[2]);
    }

    return data;
  });
}
