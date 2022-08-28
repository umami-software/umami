import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function resetWebsite(website_id) {
  const { client, multiQuery } = prisma;

  return multiQuery([
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
    if (process.env.REDIS_URL) {
      await redis.del(`website:${res.website_uuid}`);
    }
  });
}
