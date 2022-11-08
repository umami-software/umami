import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function deleteWebsite(id) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { id } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { id } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { id } } },
    }),
    client.session.deleteMany({
      where: { website: { id } },
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
