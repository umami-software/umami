import { endOfDay, startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import type { Prisma, Website } from '@/generated/prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { normalizeTimezone } from '@/lib/date';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import type { QueryFilters } from '@/lib/types';
import { getWebsiteListStats } from '@/queries/sql';

const ACTIVITY_ORDER_FIELDS = ['pageviews', 'visitors'] as const;

function isValidDate(value?: Date) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isActivityOrderBy(orderBy?: string): orderBy is (typeof ACTIVITY_ORDER_FIELDS)[number] {
  return ACTIVITY_ORDER_FIELDS.includes(orderBy as (typeof ACTIVITY_ORDER_FIELDS)[number]);
}

function getActivityDateRange(filters: QueryFilters = {}) {
  if (isValidDate(filters.startDate) && isValidDate(filters.endDate)) {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }

  const timezone =
    filters.timezone && filters.timezone.toLowerCase() !== 'utc'
      ? normalizeTimezone(filters.timezone)
      : 'UTC';
  const zonedNow = utcToZonedTime(new Date(), timezone);

  return {
    startDate: zonedTimeToUtc(startOfDay(zonedNow), timezone),
    endDate: zonedTimeToUtc(endOfDay(zonedNow), timezone),
  };
}

async function getWebsitesByActivity(
  criteria: Prisma.WebsiteFindManyArgs,
  filters: QueryFilters,
  orderBy: (typeof ACTIVITY_ORDER_FIELDS)[number],
) {
  const { page = 1, pageSize, sortDescending = true, search } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const websites = await prisma.client.website.findMany(criteria);
  const count = websites.length;

  if (count === 0) {
    return attachShareIdToWebsites({
      data: [],
      count,
      page: +page,
      pageSize: size,
      orderBy,
      search,
      sortDescending,
    });
  }

  const { startDate, endDate } = getActivityDateRange(filters);
  const stats = await getWebsiteListStats(
    websites.map(website => website.id),
    {
      startDate,
      endDate,
    },
  );
  const statsByWebsiteId = new Map(
    stats.map(stat => [
      stat.websiteId,
      {
        pageviews: Number(stat.pageviews) || 0,
        visitors: Number(stat.visitors) || 0,
      },
    ]),
  );
  const direction = sortDescending ? -1 : 1;
  const data = [...websites]
    .sort((a, b) => {
      const aValue = statsByWebsiteId.get(a.id)?.[orderBy] || 0;
      const bValue = statsByWebsiteId.get(b.id)?.[orderBy] || 0;

      if (aValue !== bValue) {
        return (aValue - bValue) * direction;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(size * (+page - 1), size * (+page - 1) + size);

  return attachShareIdToWebsites({
    data,
    count,
    page: +page,
    pageSize: size,
    orderBy,
    search,
    sortDescending,
  });
}

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
  const { orderBy, search } = filters;
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

  if (isActivityOrderBy(orderBy)) {
    return getWebsitesByActivity({ ...criteria, where }, filters, orderBy);
  }

  const websites = await pagedQuery('website', { ...criteria, where }, filters);

  return attachShareIdToWebsites(websites);
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
  sortDescending?: boolean;
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
