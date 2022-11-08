import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function deleteUser(userId) {
  const { client } = prisma;

  const websites = await client.website.findMany({
    where: { userId },
  });

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
      client.user.delete({
        where: {
          id: userId,
        },
      }),
    ])
    .then(async data => {
      if (cache.enabled) {
        const ids = websites.map(a => a.id);

        for (let i = 0; i < ids.length; i++) {
          await cache.deleteWebsite(`website:${ids[i]}`);
        }
      }

      return data;
    });
}
