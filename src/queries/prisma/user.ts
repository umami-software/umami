import { Prisma } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import { getRandomChars } from '@/lib/generate';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters, Role } from '@/lib/types';

import UserFindManyArgs = Prisma.UserFindManyArgs;

const USER_SORT_FIELDS = ['username', 'role', 'createdAt'] as const;

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

async function findUser(criteria: Prisma.UserFindUniqueArgs, options: GetUserOptions = {}) {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findUnique({
    ...criteria,
    where: {
      ...criteria.where,
      ...(showDeleted ? {} : { deletedAt: null }),
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
  return findUser({ where: { username: username.toLowerCase() } }, options);
}

export async function getUsers(criteria: UserFindManyArgs, filters: QueryFilters = {}) {
  const sortFilters = sanitizeSortFilters(filters, USER_SORT_FIELDS, {
    orderBy: 'createdAt',
    sortDescending: true,
  });
  const { search } = sortFilters;

  const where: Prisma.UserWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [{ username: 'contains' }]),
    deletedAt: null,
  };

  return prisma.pagedQuery(
    'user',
    {
      ...criteria,
      where,
    },
    sortFilters,
  );
}

export async function createUser(data: {
  id: string;
  username: string;
  password: string;
  role: Role;
}) {
  return prisma.client.user.create({
    data,
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
}

export async function updateUser(userId: string, data: Prisma.UserUpdateInput) {
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

export async function deleteUser(userId: string) {
  const { client, transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  const websites = await client.website.findMany({
    where: { userId },
  });

  let websiteIds = [];

  if (websites.length > 0) {
    websiteIds = websites.map(a => a.id);
  }

  const teams = await client.team.findMany({
    where: {
      members: {
        some: {
          userId,
          role: ROLES.teamOwner,
        },
      },
    },
  });

  const teamIds = teams.map(a => a.id);

  const ownedFilter = cloudMode ? { userId } : { OR: [{ userId }, { teamId: { in: teamIds } }] };

  const [links, pixels, boards] = await Promise.all([
    client.link.findMany({
      where: ownedFilter,
      select: { id: true, slug: true, deletedAt: true },
    }),
    client.pixel.findMany({
      where: ownedFilter,
      select: { id: true, slug: true, deletedAt: true },
    }),
    client.board.findMany({ where: ownedFilter, select: { id: true } }),
  ]);
  const entityIds = [...links.map(l => l.id), ...pixels.map(p => p.id), ...boards.map(b => b.id)];
  // Only invalidate Redis cache for slugs that are still live (not already soft-deleted).
  const linkSlugs = links.filter(l => !l.deletedAt).map(l => l.slug);
  const pixelSlugs = pixels.filter(p => !p.deletedAt).map(p => p.slug);

  const invalidateRedis = async () => {
    if (redis.enabled && (linkSlugs.length || pixelSlugs.length)) {
      await Promise.all([
        ...linkSlugs.map(slug => redis.client.del(`link:${slug}`)),
        ...pixelSlugs.map(slug => redis.client.del(`pixel:${slug}`)),
      ]);
    }
  };

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
      client.share.deleteMany({ where: { entityId: { in: entityIds } } }),
      // deletedAt: null avoids restamping rows that were already soft-deleted earlier.
      client.link.updateMany({
        data: { deletedAt: new Date() },
        where: { userId, deletedAt: null },
      }),
      client.pixel.updateMany({
        data: { deletedAt: new Date() },
        where: { userId, deletedAt: null },
      }),
      client.board.deleteMany({ where: { userId } }),
    ]).then(async result => {
      await invalidateRedis();
      return result;
    });
  }

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.sessionData.deleteMany({
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
    client.share.deleteMany({ where: { entityId: { in: entityIds } } }),
    client.link.deleteMany({ where: ownedFilter }),
    client.pixel.deleteMany({ where: ownedFilter }),
    client.board.deleteMany({ where: ownedFilter }),
    client.website.deleteMany({
      where: { id: { in: websiteIds } },
    }),
    client.user.delete({
      where: {
        id: userId,
      },
    }),
  ]).then(async result => {
    await invalidateRedis();
    return result;
  });
}
