import { Prisma } from '@prisma/client';
import { ROLES } from 'lib/constants';
import prisma from 'lib/prisma';
import { PageResult, Role, User, PageParams } from 'lib/types';
import { getRandomChars } from 'next-basics';
import UserFindManyArgs = Prisma.UserFindManyArgs;

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

async function findUser(
  criteria: Prisma.UserFindUniqueArgs,
  options: GetUserOptions = {},
): Promise<User> {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findUnique({
    ...criteria,
    where: {
      ...criteria.where,
      ...(showDeleted && { deletedAt: null }),
    },
    select: {
      id: true,
      username: true,
      password: includePassword,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUser(userId: string, options: GetUserOptions = {}) {
  return findUser(
    {
      where: {
        id: userId,
      },
    },
    options,
  );
}

export async function getUserByUsername(username: string, options: GetUserOptions = {}) {
  return findUser({ where: { username } }, options);
}

export async function getUsers(
  criteria: UserFindManyArgs,
  filters?: PageParams,
): Promise<PageResult<User[]>> {
  const { query } = filters;

  const where: Prisma.UserWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(query, [{ username: 'contains' }]),
    deletedAt: null,
  };

  return prisma.pagedQuery(
    'user',
    {
      ...criteria,
      where,
    },
    {
      orderBy: 'createdAt',
      sortDescending: true,
      ...filters,
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

export async function updateUser(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.client.user.update({
    where: {
      id: userId,
    },
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
  const { client, transaction } = prisma;
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

  if (cloudMode) {
    return transaction([
      client.website.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: { id: { in: websiteIds } },
      }),
      client.user.update({
        data: {
          username: getRandomChars(32),
          deletedAt: new Date(),
        },
        where: {
          id: userId,
        },
      }),
    ]);
  }

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.websiteEvent.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.session.deleteMany({
      where: { websiteId: { in: websiteIds } },
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
    client.website.deleteMany({
      where: { id: { in: websiteIds } },
    }),
    client.user.delete({
      where: {
        id: userId,
      },
    }),
  ]);
}
