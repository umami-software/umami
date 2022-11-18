import { Prisma } from '@prisma/client';
import { UmamiApi } from 'interface/enum';
import cache from 'lib/cache';
import prisma from 'lib/prisma';

export interface User {
  id: string;
  username: string;
  password?: string;
  createdAt?: Date;
}

export async function createUser(data: {
  id: string;
  username: string;
  password: string;
}): Promise<{
  id: string;
  username: string;
}> {
  return prisma.client.user.create({
    data,
    select: {
      id: true,
      username: true,
    },
  });
}

export async function getUser(
  where: Prisma.UserWhereUniqueInput,
  includePassword = false,
): Promise<User> {
  return prisma.client.user.findUnique({
    where,
    select: {
      id: true,
      username: true,
      userRole: {
        include: {
          role: true,
        },
      },
      password: includePassword,
    },
  });
}

export async function getUsers(): Promise<User[]> {
  return prisma.client.user.findMany({
    orderBy: [
      {
        username: 'asc',
      },
    ],
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });
}

export async function getUsersByTeamId(teamId): Promise<User[]> {
  return prisma.client.user.findMany({
    where: {
      teamUser: {
        every: {
          teamId,
        },
      },
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  data: Prisma.UserUpdateInput,
  where: Prisma.UserWhereUniqueInput,
): Promise<User> {
  return prisma.client.user
    .update({
      where,
      data,
      select: {
        id: true,
        username: true,
        createdAt: true,
        userRole: true,
      },
    })
    .then(user => {
      const { userRole, ...rest } = user;

      return { ...rest, isAdmin: userRole.some(a => a.roleId === UmamiApi.SystemRole.Admin) };
    });
}

export async function deleteUser(
  userId: string,
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Prisma.BatchPayload, User]> {
  const { client } = prisma;

  const websites = await client.userWebsite.findMany({
    where: { userId },
  });

  let websiteIds = [];

  if (websites.length > 0) {
    websiteIds = websites.map(a => a.websiteId);
  }

  return client
    .$transaction([
      client.websiteEvent.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.session.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.website.updateMany({
        data: {
          isDeleted: true,
        },
        where: { id: { in: websiteIds } },
      }),
      client.user.update({
        data: {
          isDeleted: true,
        },
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
