import { Prisma, Website } from '@prisma/client';
import prisma from 'lib/prisma';
import { PageResult, PageParams } from 'lib/types';
import WebsiteFindManyArgs = Prisma.WebsiteFindManyArgs;

async function findWebsite(criteria: Prisma.WebsiteFindUniqueArgs): Promise<Website> {
  return prisma.client.website.findUnique(criteria);
}

export async function getWebsite(websiteId: string) {
  return findWebsite({
    where: {
      id: websiteId,
    },
  });
}

export async function getSharedWebsite(shareId: string) {
  return findWebsite({
    where: {
      shareId,
    },
  });
}

export async function getWebsites(
  criteria: WebsiteFindManyArgs,
  filters: PageParams,
): Promise<PageResult<Website[]>> {
  const { query } = filters;

  const where: Prisma.WebsiteWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(query, [
      {
        name: 'contains',
      },
      { domain: 'contains' },
    ]),
    deletedAt: null,
  };

  return prisma.pagedQuery('website', { ...criteria, where }, filters);
}

export async function getAllWebsites(userId: string) {
  return prisma.client.website.findMany({
    where: {
      userId,
    },
  });
}

export async function getUserWebsites(
  userId: string,
  filters?: PageParams,
): Promise<PageResult<Website[]>> {
  return getWebsites(
    {
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    },
    {
      orderBy: 'name',
      ...filters,
    },
  );
}

export async function getTeamWebsites(
  teamId: string,
  filters?: PageParams,
): Promise<PageResult<Website[]>> {
  return getWebsites(
    {
      where: {
        teamId,
      },
      include: {
        createUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
    filters,
  );
}

export async function createWebsite(
  data: Prisma.WebsiteCreateInput | Prisma.WebsiteUncheckedCreateInput,
): Promise<Website> {
  return prisma.client.website.create({
    data,
  });
}

export async function updateWebsite(
  websiteId: string,
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
  websiteId: string,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId },
    }),
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.website.update({
      where: { id: websiteId },
      data: {
        resetAt: new Date(),
      },
    }),
  ]);
}

export async function deleteWebsite(
  websiteId: string,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Website]> {
  const { client, transaction } = prisma;
  const cloudMode = process.env.CLOUD_MODE;

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId },
    }),
    client.websiteEvent.deleteMany({
      where: { websiteId },
    }),
    client.session.deleteMany({
      where: { websiteId },
    }),
    client.report.deleteMany({
      where: {
        websiteId,
      },
    }),
    cloudMode
      ? client.website.update({
          data: {
            deletedAt: new Date(),
          },
          where: { id: websiteId },
        })
      : client.website.delete({
          where: { id: websiteId },
        }),
  ]);
}
