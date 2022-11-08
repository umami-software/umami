import prisma from 'lib/prisma';
import cache from 'lib/cache';

export async function deleteUser(userId) {
  const { client } = prisma;

  const websites = await client.website.findMany({
    where: { userId },
  });

  let websiteIds = [];

  if (websites.length > 0) {
    websiteIds = websites.map(a => a.id);
  }

  return client
    .$transaction([
      client.pageview.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.eventData.deleteMany({
        where: { event: { websiteId: { in: websiteIds } } },
      }),
      client.event.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.session.deleteMany({
        where: { websiteId: { in: websiteIds } },
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
