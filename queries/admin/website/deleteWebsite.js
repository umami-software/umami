import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';
import { getWebsiteById } from 'queries';

export async function deleteWebsite(website_id) {
  const { client, transaction } = prisma;

  const { website_uuid } = await getWebsiteById(website_id);

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { website_id } } },
    }),
    client.event_data.deleteMany({
      where: { event: { session: { website: { website_id } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { website_id } } },
    }),
    client.session.deleteMany({
      where: { website: { website_id } },
    }),
    client.website.delete({
      where: { website_id },
    }),
  ]).then(async res => {
    if (redis.client) {
      await redis.client.set(`website:${website_uuid}`, DELETED);
    }

    return res;
  });
}
