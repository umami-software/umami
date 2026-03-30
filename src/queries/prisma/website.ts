import { endOfDay, startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import type { Prisma, Website } from '@/generated/prisma/client';
import clickhouse from '@/lib/clickhouse';
import { DEFAULT_PAGE_SIZE, ROLES } from '@/lib/constants';
import { normalizeTimezone } from '@/lib/date';
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

function getActivityOrderQuery(
  orderBy: (typeof ACTIVITY_ORDER_FIELDS)[number],
  websiteFilterWhereClause: string,
) {
  if (orderBy === 'visitors') {
    return `
      select
        session.website_id as website_id,
        count(*) as value
      from session
      where session.created_at between {{startDate}} and {{endDate}}
        and session.website_id in (
          select filtered_website.website_id
          from website filtered_website
          where ${websiteFilterWhereClause}
        )
      group by session.website_id
    `;
  }

  if (orderBy === 'pageviews' && !clickhouse.enabled) {
    return `
      select
        website_event.website_id as website_id,
        count(*) as value
      from website_event
      where website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        and website_event.website_id in (
          select filtered_website.website_id
          from website filtered_website
          where ${websiteFilterWhereClause}
        )
      group by website_event.website_id
    `;
  }
}

function getWebsiteActivityFilter(
  where: Prisma.WebsiteWhereInput = {},
  search?: string,
  alias = 'website',
): { whereClause: string; queryParams: Record<string, any> } | null {
  const queryParams: Record<string, any> = {};
  const conditions = [`${alias}.deleted_at is null`];

  if (search) {
    conditions.push(`(${alias}.name ilike {{search}} or ${alias}.domain ilike {{search}})`);
    queryParams.search = `%${search}%`;
  }

  if (where?.userId) {
    conditions.push(`${alias}.user_id = {{userId::uuid}}`);
    queryParams.userId = where.userId;
  } else if (where?.teamId) {
    conditions.push(`${alias}.team_id = {{teamId::uuid}}`);
    queryParams.teamId = where.teamId;
  } else if (Array.isArray(where?.OR)) {
    const userFilter = where.OR.find((item: Prisma.WebsiteWhereInput) => item?.userId);
    const teamFilter = where.OR.find(
      (item: Prisma.WebsiteWhereInput) => item?.team?.members?.some?.userId,
    );
    const teamMemberFilter = teamFilter?.team?.members?.some;

    if (!userFilter?.userId || !teamMemberFilter?.userId || !teamMemberFilter?.role) {
      return null;
    }

    conditions.push(`(
      ${alias}.user_id = {{userId::uuid}}
      or exists (
        select 1
        from team
        inner join team_user on team_user.team_id = team.team_id
        where team.team_id = ${alias}.team_id
          and team.deleted_at is null
          and team_user.user_id = {{teamUserId::uuid}}
          and team_user.role = {{teamUserRole}}
      )
    )`);
    queryParams.userId = userFilter.userId;
    queryParams.teamUserId = teamMemberFilter.userId;
    queryParams.teamUserRole = teamMemberFilter.role;
  } else {
    const unsupportedKeys = Object.keys(where || {}).filter(key => !['AND', 'deletedAt'].includes(key));

    if (unsupportedKeys.length > 0) {
      return null;
    }
  }

  return {
    whereClause: conditions.join('\n      and '),
    queryParams,
  };
}

async function fetchActivitySortedWebsitePage(
  criteria: Prisma.WebsiteFindManyArgs,
  filters: QueryFilters,
  orderBy: (typeof ACTIVITY_ORDER_FIELDS)[number],
) {
  const activityFilter = getWebsiteActivityFilter(criteria.where, filters.search);
  const scopedActivityFilter = getWebsiteActivityFilter(
    criteria.where,
    filters.search,
    'filtered_website',
  );
  const activityOrderQuery = scopedActivityFilter
    ? getActivityOrderQuery(orderBy, scopedActivityFilter.whereClause)
    : null;

  if (!activityOrderQuery || !activityFilter || !scopedActivityFilter) {
    return null;
  }

  const { rawQuery } = prisma;
  const { page = 1, pageSize, sortDescending = true } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = size * (+page - 1);
  const direction = sortDescending ? 'desc' : 'asc';
  const { startDate, endDate } = getActivityDateRange(filters);
  const queryParams = {
    ...activityFilter.queryParams,
    startDate,
    endDate,
  };

  const countResult = (await rawQuery(
    `
    select count(*) as count
    from website
    where ${activityFilter.whereClause}
    `,
    activityFilter.queryParams,
  )) as { count: number }[];
  const [{ count = 0 } = {}] = countResult;
  const total = Number(count) || 0;

  if (total === 0) {
    return {
      ids: [],
      count: 0,
      page: +page,
      pageSize: size,
      orderBy,
      search: filters.search,
      sortDescending,
    };
  }

  const rows = (await rawQuery(
    `
    select website.website_id as id
    from website
    left join (
      ${activityOrderQuery}
    ) activity on activity.website_id = website.website_id
    where ${activityFilter.whereClause}
    order by coalesce(activity.value, 0) ${direction}, website.name asc, website.website_id asc
    limit ${size} offset ${offset}
    `,
    queryParams,
  )) as { id: string }[];

  return {
    ids: rows.map(row => row.id),
    count: total,
    page: +page,
    pageSize: size,
    orderBy,
    search: filters.search,
    sortDescending,
  };
}

async function fetchActivitySortedWebsiteDetails(
  criteria: Prisma.WebsiteFindManyArgs,
  ids: string[],
) {
  if (ids.length === 0) {
    return [];
  }

  const websites = await prisma.client.website.findMany({
    ...criteria,
    where: {
      id: {
        in: ids,
      },
    },
  });

  const websiteById = new Map(websites.map(website => [website.id, website]));

  return ids.map(id => websiteById.get(id)).filter(Boolean);
}

async function getWebsitesByActivityFallback(
  criteria: Prisma.WebsiteFindManyArgs,
  filters: QueryFilters,
  orderBy: (typeof ACTIVITY_ORDER_FIELDS)[number],
) {
  const { page = 1, pageSize, sortDescending = true, search } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const websiteRefs = await prisma.client.website.findMany({
    where: criteria.where,
    select: {
      id: true,
      name: true,
    },
  });
  const count = websiteRefs.length;

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
    websiteRefs.map(website => website.id),
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
  const ids = [...websiteRefs]
    .sort((a, b) => {
      const aValue = statsByWebsiteId.get(a.id)?.[orderBy] || 0;
      const bValue = statsByWebsiteId.get(b.id)?.[orderBy] || 0;

      if (aValue !== bValue) {
        return (aValue - bValue) * direction;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(size * (+page - 1), size * (+page - 1) + size)
    .map(website => website.id);
  const data = await fetchActivitySortedWebsiteDetails(criteria, ids);

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

async function getWebsitesByActivity(
  criteria: Prisma.WebsiteFindManyArgs,
  filters: QueryFilters,
  orderBy: (typeof ACTIVITY_ORDER_FIELDS)[number],
) {
  const pageData = await fetchActivitySortedWebsitePage(criteria, filters, orderBy);

  if (pageData) {
    const data = await fetchActivitySortedWebsiteDetails(criteria, pageData.ids);

    return attachShareIdToWebsites({
      ...pageData,
      data,
    });
  }

  return getWebsitesByActivityFallback(criteria, filters, orderBy);
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
  orderBy?: string;
  search?: string;
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
