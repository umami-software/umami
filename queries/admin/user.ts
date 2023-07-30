import { Prisma, Team, TeamUser } from '@prisma/client';
import { getRandomChars } from 'next-basics';
import cache from 'lib/cache';
import { ROLES } from 'lib/constants';
import prisma from 'lib/prisma';
import { Website, User, Role } from 'lib/types';

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

async function getUser(
  where: Prisma.UserWhereInput | Prisma.UserWhereUniqueInput,
  options: GetUserOptions = {},
): Promise<User> {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findFirst({
    where: { ...where, ...(showDeleted ? {} : { deletedAt: null }) },
    select: {
      id: true,
      username: true,
      password: includePassword,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserById(userId: string, options: GetUserOptions = {}) {
  return getUser({ id: userId }, options);
}

export async function getUserByUsername(username: string, options: GetUserOptions = {}) {
  return getUser({ username }, options);
}

export async function getUsers(): Promise<User[]> {
  return prisma.client.user.findMany({
    take: 100,
    where: {
      deletedAt: null,
    },
    orderBy: [
      {
        username: 'asc',
      },
    ],
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserTeams(userId: string): Promise<
  (Team & {
    teamUser: (TeamUser & {
      user: { id: string; username: string };
    })[];
  })[]
> {
  return prisma.client.team.findMany({
    where: {
      teamUser: {
        some: {
          userId,
        },
      },
    },
    include: {
      teamUser: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
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

export async function createUser(data: {
  id: string;
  username: string;
  password: string;
  role: Role;
}): Promise<{
  id: string;
  username: string;
  role: string;
}> {
  return prisma.client.user.create({
    data,
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
}

export async function updateUser(
  data: Prisma.UserUpdateInput,
  where: Prisma.UserWhereUniqueInput,
): Promise<User> {
  return prisma.client.user.update({
    where,
    data,
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(
  userId: string,
): Promise<
  [
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    User,
  ]
> {
  const { client } = prisma;
  const cloudMode = process.env.CLOUD_MODE;

  const websites = await client.website.findMany({
    where: { userId },
  });

  let websiteIds = [];

  if (websites.length > 0) {
    websiteIds = websites.map(a => a.id);
  }

  const teams = await client.team.findMany({
    where: {
      teamUser: {
        some: {
          userId,
          role: ROLES.teamOwner,
        },
      },
    },
  });

  const teamIds = teams.map(a => a.id);

  return prisma
    .transaction([
      client.eventData.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.websiteEvent.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.session.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.teamWebsite.deleteMany({
        where: {
          OR: [
            {
              websiteId: {
                in: websiteIds,
              },
            },
            {
              teamId: {
                in: teamIds,
              },
            },
          ],
        },
      }),
      client.teamWebsite.deleteMany({
        where: {
          teamId: {
            in: teamIds,
          },
        },
      }),
      client.teamUser.deleteMany({
        where: {
          OR: [
            {
              teamId: {
                in: teamIds,
              },
            },
            {
              userId,
            },
          ],
        },
      }),
      client.team.deleteMany({
        where: {
          id: {
            in: teamIds,
          },
        },
      }),
      client.report.deleteMany({
        where: {
          OR: [
            {
              websiteId: {
                in: websiteIds,
              },
            },
            {
              userId,
            },
          ],
        },
      }),
      cloudMode
        ? client.website.updateMany({
            data: {
              deletedAt: new Date(),
            },
            where: { id: { in: websiteIds } },
          })
        : client.website.deleteMany({
            where: { id: { in: websiteIds } },
          }),
      cloudMode
        ? client.user.update({
            data: {
              username: getRandomChars(32),
              deletedAt: new Date(),
            },
            where: {
              id: userId,
            },
          })
        : client.user.delete({
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
