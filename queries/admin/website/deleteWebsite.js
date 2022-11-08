import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function deleteWebsite(id) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { websiteId: id },
    }),
    client.eventData.deleteMany({
      where: { event: { websiteId: id } },
    }),
    client.event.deleteMany({
      where: { websiteId: id },
    }),
    client.session.deleteMany({
      where: { websiteId: id },
    }),
    client.website.delete({
      where: { id },
    }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.deleteWebsite(id);
    }

    return data;
  });
}
