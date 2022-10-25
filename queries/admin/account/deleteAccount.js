import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';

export async function deleteAccount(userId) {
  const { client } = prisma;

  const websites = await client.website.findMany({
    where: { userId },
    select: { websiteUuid: true },
  });

  let websiteUuids = [];

  if (websites.length > 0) {
    websiteUuids = websites.map(a => a.websiteUuid);
  }

  return client
    .$transaction([
      client.pageview.deleteMany({
        where: { session: { website: { userId } } },
      }),
      client.eventData.deleteMany({
        where: { event: { session: { website: { userId } } } },
      }),
      client.event.deleteMany({
        where: { session: { website: { userId } } },
      }),
      client.session.deleteMany({
        where: { website: { userId } },
      }),
      client.website.deleteMany({
        where: { userId },
      }),
      client.account.delete({
        where: {
          id: userId,
        },
      }),
    ])
    .then(async res => {
      if (redis.client) {
        for (let i = 0; i < websiteUuids.length; i++) {
          await redis.set(`website:${websiteUuids[i]}`, DELETED);
        }
      }

      return res;
    });
}
