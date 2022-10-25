import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function getWebsiteByUuid(websiteUuid) {
  return prisma.client.website
    .findUnique({
      where: {
        websiteUuid,
      },
    })
    .then(async res => {
      if (redis.client && res) {
        await redis.client.set(`website:${res.websiteUuid}`, res.id);
      }

      return res;
    });
}
