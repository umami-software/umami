import { Prisma, Website } from '@prisma/client';
import cache from 'lib/cache';
import prisma from 'lib/prisma';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getWebsite(where: Prisma.WebsiteWhereUniqueInput): Promise<Website> {
  return prisma.client.website.findUnique({
    where,
  });
}

export async function getWebsites(): Promise<Website[]> {
  return prisma.client.website.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createWebsite(
  data: Prisma.WebsiteCreateInput | Prisma.WebsiteUncheckedCreateInput,
): Promise<Website> {
  return prisma.client.website
    .create({
      data,
    })
    .then(async data => {
      if (cache.enabled) {
        await cache.storeWebsite(data);
      }

      return data;
    });
}

export async function updateWebsite(
  websiteId,
  data: Prisma.WebsiteUpdateInput | Prisma.WebsiteUncheckedUpdateInput,
): Promise<Website> {
  return prisma.client.website.update({
    where: {
      id: websiteId,
    },
    data,
  });
}

export async function resetWebsite(
  websiteId,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;

  const { revId } = await getWebsite({ id: websiteId });

  return transaction([
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.website.update({ where: { id: websiteId }, data: { revId: revId + 1 } }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.storeWebsite(data[2]);
    }

    return data;
  });
}

export async function deleteWebsite(websiteId: string) {
  return runQuery({
    [PRISMA]: () => deleteWebsiteRelationalQuery(websiteId),
    [CLICKHOUSE]: () => deleteWebsiteClickhouseQuery(websiteId),
  });
}

async function deleteWebsiteRelationalQuery(
  websiteId,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;

  return transaction([
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.website.delete({
      where: { id: websiteId },
    }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.deleteWebsite(websiteId);
    }

    return data;
  });
}

async function deleteWebsiteClickhouseQuery(websiteId): Promise<Website> {
  return prisma.client.website.update({
    data: {
      deletedAt: new Date(),
    },
    where: { id: websiteId },
  });
}
