import prisma from 'lib/prisma';
import redis from 'lib/redis';

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
    .then(async res => {
      if (redis.enabled && res) {
        await redis.set(`website:${res.id}`, 1);
      }

      return res;
    });
}
