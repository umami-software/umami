import { Prisma, type Team } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { sanitizeSortFilters } from '@/lib/sort';
import type { PageResult, QueryFilters } from '@/lib/types';

import TeamFindManyArgs = Prisma.TeamFindManyArgs;

const TEAM_SORT_FIELDS = ['name', 'createdAt'] as const;

export async function findTeam(criteria: Prisma.TeamFindUniqueArgs): Promise<Team> {
  return prisma.client.team.findUnique(criteria);
}

export async function getTeam(
  teamId: string,
  options: { includeMembers?: boolean } = {},
): Promise<Team> {
  const { includeMembers } = options;

  return findTeam({
    where: {
      id: teamId,
    },
    ...(includeMembers && { include: { members: true } }),
  });
}

export async function getTeams(
  criteria: TeamFindManyArgs,
  filters: QueryFilters,
): Promise<PageResult<Team[]>> {
  const { getSearchParameters } = prisma;
  const sortFilters = sanitizeSortFilters(filters, TEAM_SORT_FIELDS);
  const { search } = sortFilters;

  const where: Prisma.TeamWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [{ name: 'contains' }]),
  };

  return prisma.pagedQuery<TeamFindManyArgs>(
    'team',
    {
      ...criteria,
      where,
    },
    sortFilters,
  );
}

export async function getUserTeams(userId: string, filters: QueryFilters = {}) {
  return getTeams(
    {
      where: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            websites: {
              where: { deletedAt: null },
            },
            members: {
              where: {
                user: { deletedAt: null },
              },
            },
          },
        },
      },
    },
    filters,
  );
}

export async function getAllUserTeams(userId: string) {
  return prisma.client.team.findMany({
    where: {
      deletedAt: null,
      members: {
        some: { userId },
      },
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  });
}

export async function getTeamOwner(teamId: string) {
  return prisma.client.teamUser.findFirst({
    where: { teamId, role: ROLES.teamOwner },
    select: { userId: true },
  });
}

export async function createTeam(data: Prisma.TeamCreateInput, userId: string): Promise<any> {
  const { id } = data;
  const { client, transaction } = prisma;

  return transaction([
    client.team.create({
      data,
    }),
    client.teamUser.create({
      data: {
        id: uuid(),
        teamId: id,
        userId,
        role: ROLES.teamOwner,
      },
    }),
  ]);
}

export async function updateTeam(teamId: string, data: Prisma.TeamUpdateInput): Promise<Team> {
  const { client } = prisma;

  return client.team.update({
    where: {
      id: teamId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteTeam(teamId: string) {
  const { client, transaction } = prisma;
  const cloudMode = !!process.env.CLOUD_MODE;

  const [links, pixels, boards] = await Promise.all([
    client.link.findMany({
      where: { teamId },
      select: { id: true, slug: true, deletedAt: true },
    }),
    client.pixel.findMany({
      where: { teamId },
      select: { id: true, slug: true, deletedAt: true },
    }),
    client.board.findMany({ where: { teamId }, select: { id: true } }),
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
      client.team.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: teamId,
        },
      }),
      client.share.deleteMany({ where: { entityId: { in: entityIds } } }),
      // deletedAt: null avoids restamping rows that were already soft-deleted earlier.
      client.link.updateMany({
        data: { deletedAt: new Date() },
        where: { teamId, deletedAt: null },
      }),
      client.pixel.updateMany({
        data: { deletedAt: new Date() },
        where: { teamId, deletedAt: null },
      }),
      client.board.deleteMany({ where: { teamId } }),
    ]).then(async result => {
      await invalidateRedis();
      return result;
    });
  }

  return transaction([
    client.teamUser.deleteMany({
      where: {
        teamId,
      },
    }),
    client.share.deleteMany({ where: { entityId: { in: entityIds } } }),
    client.link.deleteMany({ where: { teamId } }),
    client.pixel.deleteMany({ where: { teamId } }),
    client.board.deleteMany({ where: { teamId } }),
    client.team.delete({
      where: {
        id: teamId,
      },
    }),
  ]).then(async result => {
    await invalidateRedis();
    return result;
  });
}
