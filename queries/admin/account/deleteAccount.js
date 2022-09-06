import prisma from 'lib/prisma';
import redis, { DELETED } from 'lib/redis';

export async function deleteAccount(user_id) {
  const { client } = prisma;

  const websites = await client.website.findMany({
    where: { user_id },
    select: { website_uuid: true },
  });

  let websiteUuids = [];

  if (websites.length > 0) {
    websiteUuids = websites.map(a => a.website_uuid);
  }

  return client
    .$transaction([
      client.pageview.deleteMany({
        where: { session: { website: { user_id } } },
      }),
      client.event_data.deleteMany({
        where: { event: { session: { website: { user_id } } } },
      }),
      client.event.deleteMany({
        where: { session: { website: { user_id } } },
      }),
      client.session.deleteMany({
        where: { website: { user_id } },
      }),
      client.website.deleteMany({
        where: { user_id },
      }),
      client.account.delete({
        where: {
          user_id,
        },
      }),
    ])
    .then(async res => {
      if (redis.client) {
        for (let i = 0; i < websiteUuids.length; i++) {
          await redis.client.set(`website:${websiteUuids[i]}`, DELETED);
        }
      }

      return res;
    });
}
