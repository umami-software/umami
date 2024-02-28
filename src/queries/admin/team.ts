import { Prisma, Team } from '@prisma/client';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';
import { FilterResult, TeamSearchFilter } from 'lib/types';
import TeamFindManyArgs = Prisma.TeamFindManyArgs;

export async function findTeam(criteria: Prisma.TeamFindUniqueArgs): Promise<Team> {
  return prisma.client.team.findUnique(criteria);
}

export async function getTeam(teamId: string, options: { includeMembers?: boolean } = {}) {
  const { includeMembers } = options;

  return findTeam({
    where: {
      id: teamId,
    },
    ...(includeMembers && { include: { teamUser: true } }),
  });
}

export async function getTeams(
  criteria: TeamFindManyArgs,
  filters: TeamSearchFilter = {},
): Promise<FilterResult<Team[]>> {
  const { getSearchParameters } = prisma;
  const { query } = filters;

  const where: Prisma.TeamWhereInput = {
    ...criteria.where,
    ...getSearchParameters(query, [{ name: 'contains' }]),
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

export async function getUserTeams(userId: string, filters: TeamSearchFilter = {}) {
  return getTeams(
    {
      where: {
        deletedAt: null,
        teamUser: {
          some: { userId },
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
        _count: {
          select: {
            website: {
              where: { deletedAt: null },
            },
            teamUser: {
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

export async function deleteTeam(
  teamId: string,
): Promise<Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Team]>> {
  const { client, transaction } = prisma;
  const cloudMode = process.env.CLOUD_MODE;

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
