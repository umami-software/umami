import prisma from 'lib/prisma';
import redis from 'lib/redis';

export async function createWebsite(user_id, data) {
  return prisma.client.website
    .create({
      data: {
        account: {
          connect: {
            user_id,
          },
        },
        ...data,
      },
    })
    .then(async res => {
      if (process.env.REDIS_URL && res) {
        await redis.set(`website:${res.website_uuid}`, Number(res.website_id));
      }

      return res;
    });
}
