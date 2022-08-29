import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function getWebsiteByUuid(website_uuid) {
  return prisma.client.website
    .findUnique({
      where: {
        website_uuid,
      },
    })
    .then(async res => {
      if (process.env.REDIS_URL && res) {
        await redis.client.set(`website:${res.website_uuid}`, 1);
      }

      return res;
    });
}
