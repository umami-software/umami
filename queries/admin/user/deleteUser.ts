import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { Prisma, User } from '@prisma/client';

export async function deleteUser(
  userId: string,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Prisma.BatchPayload, User]> {
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
      client.websiteEvent.deleteMany({
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
