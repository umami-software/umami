import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function getWebsite(where) {
  return prisma.client.website
    .findUnique({
      where,
      include: {
        viewers: true,
      },
    })
    .then(async data => {
      if (redis.enabled && data) {
        await redis.set(`website:${data.websiteUuid}`, data.id);
      }

      return data;
    });
}
