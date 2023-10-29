import { Prisma } from '@prisma/client';
import cache from 'lib/cache';
import { ROLES } from 'lib/constants';
import prisma from 'lib/prisma';
import { FilterResult, Role, User, UserSearchFilter } from 'lib/types';
import { getRandomChars } from 'next-basics';

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

export async function getUsers(
  params: UserSearchFilter,
  options?: { include?: Prisma.UserInclude },
): Promise<FilterResult<User[]>> {
  const { teamId, query } = params;
  const mode = prisma.getSearchMode();

  const where: Prisma.UserWhereInput = {
    ...(teamId && {
      teamUser: {
        some: {
          teamId,
        },
      },
    }),
    ...(query && {
      AND: {
        OR: [
          {
            username: {
              contains: query,
              ...mode,
            },
          },
        ],
      },
    }),
  };

  const [pageFilters, getParameters] = prisma.getPageFilters({
    orderBy: 'username',
    ...params,
  });

  const users = await prisma.client.user
    .findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      ...pageFilters,
      ...(options?.include && { include: options.include }),
    })
    .then(a => {
      return a.map(({ password, ...rest }) => rest);
    });

  const count = await prisma.client.user.count({
    where: {
      ...where,
      deletedAt: null,
    },
  });

  return { data: users as any, count, ...getParameters };
}

export async function getUsersByTeamId(teamId: string, filter?: UserSearchFilter) {
  return getUsers(
    { teamId, ...filter },
    {
      include: {
        teamUser: {
          select: {
            role: true,
          },
        },
      },
    },
  );
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
