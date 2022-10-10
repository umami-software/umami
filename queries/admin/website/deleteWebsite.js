import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';
import { getWebsiteById } from 'queries';

export async function deleteWebsite(websiteId) {
  const { client, transaction } = prisma;

  const { websiteUuid } = await getWebsiteById(websiteId);

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { id: websiteId } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { id: websiteId } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { id: websiteId } } },
    }),
    client.session.deleteMany({
      where: { website: { id: websiteId } },
    }),
    client.website.delete({
      where: { id: websiteId },
    }),
  ]).then(async res => {
    if (redis.client) {
      await redis.client.set(`website:${websiteUuid}`, DELETED);
    }

    return res;
  });
}
