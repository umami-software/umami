import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';

export async function deleteWebsite(websiteUuid) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { websiteUuid } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { websiteUuid } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { websiteUuid } } },
    }),
    client.session.deleteMany({
      where: { website: { websiteUuid } },
    }),
    client.website.delete({
      where: { websiteUuid },
    }),
  ]).then(async res => {
    if (redis.enabled) {
      await redis.set(`website:${websiteUuid}`, DELETED);
    }

    return res;
  });
}
