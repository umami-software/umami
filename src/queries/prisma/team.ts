import { uuid } from '@/lib/crypto';
import { Prisma, Team } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageResult, QueryFilters } from '@/lib/types';
import TeamFindManyArgs = Prisma.TeamFindManyArgs;

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
  const { search } = filters;

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
    filters,
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
    ]);
  }

  return transaction([
    client.teamUser.deleteMany({
      where: {
        teamId,
      },
    }),
    client.team.delete({
      where: {
        id: teamId,
      },
    }),
  ]);
}
