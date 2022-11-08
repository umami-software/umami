import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function createWebsite(userId, data) {
  return prisma.client.website
    .create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        ...data,
      },
    })
    .then(async data => {
      if (cache.enabled) {
        await cache.storeWebsite(data);
      }

      return data;
    });
}
