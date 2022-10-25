import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';
import { getWebsiteByUuid } from 'queries';

export async function deleteWebsite(websiteId) {
  const { client, transaction } = prisma;

  const { websiteUuid } = await getWebsiteByUuid(websiteId);

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { websiteUuid: websiteId } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { websiteUuid: websiteId } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { websiteUuid: websiteId } } },
    }),
    client.session.deleteMany({
      where: { website: { websiteUuid: websiteId } },
    }),
    client.website.delete({
      where: { websiteUuid: websiteId },
    }),
  ]).then(async res => {
    if (redis.client) {
      await redis.client.set(`website:${websiteUuid}`, DELETED);
    }

    return res;
  });
}
