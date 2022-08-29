import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function resetWebsite(website_id) {
  const { client, transaction } = prisma;

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
  ]).then(async res => {
    if (redis.client) {
      await redis.del(`website:${res.website_uuid}`);
    }
  });
}
