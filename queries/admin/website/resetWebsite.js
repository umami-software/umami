import prisma from 'lib/prisma';
import { getWebsite } from 'queries';
import cache from 'lib/cache';

export async function resetWebsite(id) {
  const { client, transaction } = prisma;

  const { revId } = await getWebsite({ id });

  return transaction([
    client.websiteEvent.deleteMany({
      where: { websiteId: id },
    }),
    client.session.deleteMany({
      where: { websiteId: id },
    }),
    client.website.update({ where: { id }, data: { revId: revId + 1 } }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.storeWebsite(data[2]);
    }

    return data;
  });
}
