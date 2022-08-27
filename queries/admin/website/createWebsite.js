import { prisma, runQuery } from 'lib/relational';
import redis from 'lib/redis';

export async function createWebsite(user_id, data) {
  return runQuery(
    prisma.website.create({
      data: {
        account: {
          connect: {
            user_id,
          },
        },
        ...data,
      },
    }),
  ).then(async res => {
    if (process.env.REDIS_URL) {
      await redis.set(`website:${res.website_uuid}`, Number(res.website_id));
    }

    return res;
  });
}
