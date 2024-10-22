import { Prisma, Website } from '@prisma/client';
import cache from 'lib/cache';
import { ROLES, WEBSITE_FILTER_TYPES } from 'lib/constants';
import prisma from 'lib/prisma';
import { FilterResult, WebsiteSearchFilter } from 'lib/types';

async function getWebsite(where: Prisma.WebsiteWhereUniqueInput): Promise<Website> {
  return prisma.client.website.findUnique({
    where,
  });
}

export async function getWebsiteById(id: string) {
  return getWebsite({ id });
}

export async function getWebsiteByShareId(shareId: string) {
  return getWebsite({ shareId });
}

export async function getWebsites(
  WebsiteSearchFilter: WebsiteSearchFilter,
  options?: { include?: Prisma.WebsiteInclude },
): Promise<FilterResult<Website[]>> {
  const {
    userId,
    teamId,
    includeTeams,
    onlyTeams,
    filter,
    filterType = WEBSITE_FILTER_TYPES.all,
  } = WebsiteSearchFilter;
  const mode = prisma.getSearchMode();

  const where: Prisma.WebsiteWhereInput = {
    ...(teamId && {
      teamWebsite: {
        some: {
          teamId,
        },
      },
    }),
    AND: [
      {
        OR: [
          {
            ...(userId &&
              !onlyTeams && {
                userId,
              }),
          },
          {
            ...((includeTeams || onlyTeams) && {
              AND: [
                {
                  teamWebsite: {
                    some: {
                      team: {
                        teamUser: {
                          some: {
                            userId,
                          },
                        },
                      },
                    },
                  },
                },
                {
                  userId: {
                    not: userId,
                  },
                },
              ],
            }),
          },
        ],
      },
      {
        OR: [
          {
            ...((filterType === WEBSITE_FILTER_TYPES.all ||
              filterType === WEBSITE_FILTER_TYPES.name) && {
              name: { startsWith: filter, ...mode },
            }),
          },
          {
            ...((filterType === WEBSITE_FILTER_TYPES.all ||
              filterType === WEBSITE_FILTER_TYPES.domain) && {
              domain: { startsWith: filter, ...mode },
            }),
          },
        ],
      },
    ],
  };

  const [pageFilters, getParameters] = prisma.getPageFilters({
    orderBy: 'name',
    ...WebsiteSearchFilter,
  });

  const websites = await prisma.client.website.findMany({
    where: {
      ...where,
      deletedAt: null,
    },
    ...pageFilters,
    ...(options?.include && { include: options.include }),
  });

  const count = await prisma.client.website.count({ where: { ...where, deletedAt: null } });

  return { data: websites, count, ...getParameters };
}

export async function getWebsitesByUserId(
  userId: string,
  filter?: WebsiteSearchFilter,
): Promise<FilterResult<Website[]>> {
  return getWebsites(
    { userId, ...filter },
    {
      include: {
        teamWebsite: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    },
  );
}

export async function getWebsitesByTeamId(
  teamId: string,
  filter?: WebsiteSearchFilter,
): Promise<FilterResult<Website[]>> {
  return getWebsites(
    {
      teamId,
      ...filter,
      includeTeams: true,
    },
    {
      include: {
        teamWebsite: {
          include: {
            team: {
              include: {
                teamUser: {
                  where: { role: ROLES.teamOwner },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  );
}

export async function getUserWebsites(
  userId: string,
  options?: { includeTeams: boolean },
): Promise<Website[]> {
  const { rawQuery } = prisma;

  if (options?.includeTeams) {
    const websites = await rawQuery(
      `
      select
        website_id as "id",
        name,
        domain,
        share_id as "shareId",
        reset_at as "resetAt",
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        deleted_at as "deletedAt",
        null as "teamId",
        null as "teamName"
      from website
      where user_id = {{userId::uuid}}
        and deleted_at is null
      union
      select           
        w.website_id as "id",
        w.name,
        w.domain,
        w.share_id as "shareId",
        w.reset_at as "resetAt",
        w.user_id as "userId",
        w.created_at as "createdAt",
        w.updated_at as "updatedAt",
        w.deleted_at as "deletedAt",
        t.team_id as "teamId",
        t.name as "teamName"
      from website w
      inner join team_website tw
        on tw.website_id = w.website_id
      inner join team t
        on t.team_id = tw.team_id
      inner join team_user tu 
        on tu.team_id = tw.team_id
      where tu.user_id = {{userId::uuid}}
        and w.deleted_at is null
      `,
      { userId },
    );

    return websites.reduce((arr, item) => {
      if (!arr.find(({ id }) => id === item.id)) {
        return arr.concat(item);
      }
      return arr;
    }, []);
  }

  return prisma.client.website.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: [
      {
        name: 'asc',
      },
    ],
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
  ]).then(async data => {
    if (cache.enabled) {
      await cache.storeWebsite(data[3]);
    }

    return data;
  });
}

export async function deleteWebsite(
  websiteId,
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
    client.teamWebsite.deleteMany({
      where: {
        websiteId,
      },
    }),
    client.report.deleteMany({
      where: {
        websiteId,
      },
    }),
    cloudMode
      ? prisma.client.website.update({
          data: {
            deletedAt: new Date(),
          },
          where: { id: websiteId },
        })
      : client.website.delete({
          where: { id: websiteId },
        }),
  ]).then(async data => {
    if (cache.enabled) {
      await cache.deleteWebsite(websiteId);
    }

    return data;
  });
}
