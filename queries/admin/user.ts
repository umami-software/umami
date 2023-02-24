import { Prisma, Team } from '@prisma/client';
import cache from 'lib/cache';
import prisma from 'lib/prisma';
import { Website } from 'lib/types';

export interface User {
  id: string;
  username: string;
  password?: string;
  createdAt?: Date;
}

export async function getUser(
  where: Prisma.UserWhereInput | Prisma.UserWhereUniqueInput,
  options: { includePassword?: boolean; showDeleted?: boolean } = {},
): Promise<User> {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findFirst({
    where: { ...where, ...(showDeleted ? {} : { deletedAt: null }) },
    select: {
      id: true,
      username: true,
      password: includePassword,
      role: true,
    },
  });
}

export async function getUsers(): Promise<User[]> {
  return prisma.client.user.findMany({
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

export async function getUserTeams(userId: string): Promise<Team[]> {
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
          user: true,
        },
      },
    },
  });
}

export async function getUserWebsites(userId: string): Promise<Website[]> {
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
  role: string;
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
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Prisma.BatchPayload, User]> {
  const { client } = prisma;
  const cloudMode = process.env.CLOUD_MODE;

  const websites = await client.website.findMany({
    where: { userId },
  });

  let websiteIds = [];

  if (websites.length > 0) {
    websiteIds = websites.map(a => a.id);
  }

  return prisma
    .transaction([
      client.websiteEvent.deleteMany({
        where: { websiteId: { in: websiteIds } },
      }),
      client.session.deleteMany({
        where: { websiteId: { in: websiteIds } },
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
