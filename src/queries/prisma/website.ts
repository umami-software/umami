import { Prisma } from '@/generated/prisma/client';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';
import { ROLES } from '@/lib/constants';

export async function findWebsite(criteria: Prisma.WebsiteFindUniqueArgs) {
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
      deletedAt: null,
    },
  });
}

export async function getWebsites(criteria: Prisma.WebsiteFindManyArgs, filters: QueryFilters) {
  const { search } = filters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.WebsiteWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      {
        name: 'contains',
      },
      { domain: 'contains' },
    ]),
    deletedAt: null,
  };

  return pagedQuery('website', { ...criteria, where }, filters);
}

export async function getAllUserWebsitesIncludingTeamOwner(userId: string, filters?: QueryFilters) {
  return getWebsites(
    {
      where: {
        OR: [
          { userId },
          {
            team: {
              deletedAt: null,
              members: {
                some: {
                  role: ROLES.teamOwner,
                  userId,
                },
              },
            },
          },
        ],
      },
    },
    {
      orderBy: 'name',
      ...filters,
    },
  );
}

export async function getUserWebsites(userId: string, filters?: QueryFilters) {
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

export async function getTeamWebsites(teamId: string, filters?: QueryFilters) {
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
) {
  return prisma.client.website.create({
    data,
  });
}

export async function updateWebsite(
  websiteId: string,
  data: Prisma.WebsiteUpdateInput | Prisma.WebsiteUncheckedUpdateInput,
) {
  return prisma.client.website.update({
    where: {
      id: websiteId,
    },
    data,
  });
}

export async function resetWebsite(websiteId: string) {
  const { client, transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  return transaction(
    [
      client.eventData.deleteMany({
        where: { websiteId },
      }),
      client.sessionData.deleteMany({
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
    ],
    {
      timeout: 30000,
    },
  ).then(async data => {
    if (cloudMode) {
      await redis.client.set(
        `website:${websiteId}`,
        data.find(website => website.id),
      );
    }

    return data;
  });
}

export async function deleteWebsite(websiteId: string) {
  const { client, transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId },
    }),
    client.sessionData.deleteMany({
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
  ]).then(async data => {
    if (cloudMode) {
      await redis.client.del(`website:${websiteId}`);
    }

    return data;
  });
}

export async function getWebsiteCount(userId: string) {
  return prisma.client.website.count({
    where: {
      userId,
      deletedAt: null,
    },
  });
}
