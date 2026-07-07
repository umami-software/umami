import type { Prisma, Website } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters } from '@/lib/types';
import { attachGroupPathToWebsites, getGroupPath } from '@/lib/websiteTree';
import { getAllWebsiteGroupsForOwner } from '@/queries/prisma/websiteGroup';

const WEBSITE_SORT_FIELDS = ['name', 'domain', 'createdAt'] as const;

export async function findWebsite(criteria: Prisma.WebsiteFindUniqueArgs) {
  return prisma.client.website.findUnique(criteria);
}

export async function getWebsite(websiteId: string) {
  const website = await findWebsite({
    where: {
      id: websiteId,
    },
  });

  if (!website) {
    return null;
  }

  return attachShareIdToWebsite(website);
}

export async function getWebsites(criteria: Prisma.WebsiteFindManyArgs, filters: QueryFilters) {
  const sortFilters = sanitizeSortFilters(filters, WEBSITE_SORT_FIELDS);
  const { search } = sortFilters;
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

  const websites = await pagedQuery('website', { ...criteria, where }, sortFilters);

  return attachGroupPathToWebsitesResult(websites, criteria.where);
}

async function attachGroupPathToWebsitesResult(
  websites: {
    data: any;
    count: any;
    page: number;
    pageSize: number;
    orderBy: string;
    search: string;
  },
  where: Prisma.WebsiteWhereInput = {},
) {
  const withShare = await attachShareIdToWebsites(websites);

  const owner = extractOwnerFromWhere(where);

  if (owner) {
    const groups = await getAllWebsiteGroupsForOwner(owner);

    return {
      ...withShare,
      data: attachGroupPathToWebsites(withShare.data, groups),
    };
  }

  const ownerKeys = new Set<string>();

  for (const website of withShare.data) {
    if (website.teamId) {
      ownerKeys.add(`team:${website.teamId}`);
    } else if (website.userId) {
      ownerKeys.add(`user:${website.userId}`);
    }
  }

  const groupsByOwner = new Map<string, Awaited<ReturnType<typeof getAllWebsiteGroupsForOwner>>>();

  await Promise.all(
    [...ownerKeys].map(async key => {
      const [type, id] = key.split(':');
      const groups = await getAllWebsiteGroupsForOwner(
        type === 'team' ? { teamId: id } : { userId: id },
      );
      groupsByOwner.set(key, groups);
    }),
  );

  return {
    ...withShare,
    data: withShare.data.map((website: any) => {
      const key = website.teamId
        ? `team:${website.teamId}`
        : website.userId
          ? `user:${website.userId}`
          : null;
      const groups = key ? (groupsByOwner.get(key) ?? []) : [];
      const groupsMap = new Map(groups.map(group => [group.id, group]));

      return {
        ...website,
        groupPath: getGroupPath(website.groupId, groupsMap),
      };
    }),
  };
}

function extractOwnerFromWhere(where: Prisma.WebsiteWhereInput): {
  userId?: string | null;
  teamId?: string | null;
} | null {
  if (where.userId && typeof where.userId === 'string') {
    return { userId: where.userId };
  }

  if (where.teamId && typeof where.teamId === 'string') {
    return { teamId: where.teamId };
  }

  return null;
}

export async function getAllUserWebsitesIncludingTeamAccess(
  userId: string,
  filters?: QueryFilters,
) {
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
                  role: { in: [ROLES.teamOwner, ROLES.teamManager] },
                  userId,
                },
              },
            },
          },
        ],
      },
    },
    sanitizeSortFilters(filters, WEBSITE_SORT_FIELDS, { orderBy: 'name' }),
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
    sanitizeSortFilters(filters, WEBSITE_SORT_FIELDS, { orderBy: 'name' }),
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
  const { transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  return transaction(
    async tx => {
      await tx.sessionReplaySaved.deleteMany({
        where: { websiteId },
      });

      await tx.sessionReplay.deleteMany({
        where: { websiteId },
      });

      await tx.revenue.deleteMany({
        where: { websiteId },
      });

      await tx.eventData.deleteMany({
        where: { websiteId },
      });

      await tx.sessionData.deleteMany({
        where: { websiteId },
      });

      await tx.websiteEvent.deleteMany({
        where: { websiteId },
      });

      await tx.session.deleteMany({
        where: { websiteId },
      });

      const website = await tx.website.update({
        where: { id: websiteId },
        data: {
          resetAt: new Date(),
        },
      });

      return website;
    },
    {
      timeout: 30000,
    },
  ).then(async data => {
    if (cloudMode) {
      await redis.client.set(`website:${websiteId}`, data);
    }

    return data;
  });
}

export async function deleteWebsite(websiteId: string) {
  const { transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  return transaction(
    async tx => {
      await tx.sessionReplaySaved.deleteMany({
        where: { websiteId },
      });

      await tx.sessionReplay.deleteMany({
        where: { websiteId },
      });

      await tx.revenue.deleteMany({
        where: { websiteId },
      });

      await tx.eventData.deleteMany({
        where: { websiteId },
      });

      await tx.sessionData.deleteMany({
        where: { websiteId },
      });

      await tx.websiteEvent.deleteMany({
        where: { websiteId },
      });

      await tx.session.deleteMany({
        where: { websiteId },
      });

      await tx.report.deleteMany({
        where: { websiteId },
      });

      await tx.segment.deleteMany({
        where: { websiteId },
      });

      await tx.share.deleteMany({
        where: { entityId: websiteId },
      });

      const website = cloudMode
        ? await tx.website.update({
            data: {
              deletedAt: new Date(),
            },
            where: { id: websiteId },
          })
        : await tx.website.delete({
            where: { id: websiteId },
          });

      return website;
    },
    {
      timeout: 30000,
    },
  ).then(async data => {
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

export async function getTeamWebsiteCount(teamId: string) {
  return prisma.client.website.count({
    where: {
      teamId,
      deletedAt: null,
    },
  });
}

export async function attachShareIdToWebsite(website: Website) {
  const share = await prisma.client.share.findFirst({
    where: {
      entityId: website.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      slug: true,
    },
  });

  return {
    ...website,
    shareId: share?.slug ?? null,
  };
}

export async function attachShareIdToWebsites(websites: {
  data: any;
  count: any;
  page: number;
  pageSize: number;
  orderBy: string;
  search: string;
}) {
  const websiteIds = websites.data.map(website => website.id);

  if (websiteIds.length === 0) {
    return {
      ...websites,
      data: websites.data.map(website => ({ ...website, shareId: null })),
    };
  }

  const shares = await prisma.client.share.findMany({
    where: {
      entityId: { in: websiteIds },
    },
    distinct: ['entityId'],
    orderBy: {
      createdAt: 'desc',
    },
  });

  const shareByWebsiteId = new Map(shares.map(share => [share.entityId, share.slug]));

  return {
    ...websites,
    data: websites.data.map(website => ({
      ...website,
      shareId: shareByWebsiteId.get(website.id) ?? null,
    })),
  };
}
