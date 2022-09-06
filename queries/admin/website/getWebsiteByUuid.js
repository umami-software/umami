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
      if (redis.client && res) {
        await redis.client.set(`website:${res.website_uuid}`, 1);
      }

      return res;
    });
}
