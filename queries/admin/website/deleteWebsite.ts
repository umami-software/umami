import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { Prisma, Website } from '@prisma/client';

export async function deleteWebsite(
  websiteId: string,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;

  return transaction([
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.website.delete({
      where: { id: websiteId },
    }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.deleteWebsite(websiteId);
    }

    return data;
  });
}
