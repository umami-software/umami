import { Prisma, Team } from '@prisma/client';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';
import { FilterResult, TeamSearchFilter } from 'lib/types';

export interface GetTeamOptions {
  includeTeamUser?: boolean;
}

async function getTeam(where: Prisma.TeamWhereInput, options: GetTeamOptions = {}): Promise<Team> {
  const { includeTeamUser = false } = options;
  const { client } = prisma;

  return client.team.findFirst({
    where,
    include: {
      teamUser: includeTeamUser,
    },
  });
}

export function getTeamById(teamId: string, options: GetTeamOptions = {}) {
  return getTeam({ id: teamId }, options);
}

export function getTeamByAccessCode(accessCode: string, options: GetTeamOptions = {}) {
  return getTeam({ accessCode }, options);
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

export async function getTeams(
  filters: TeamSearchFilter,
  options?: { include?: Prisma.TeamInclude },
): Promise<FilterResult<Team[]>> {
  const { userId, query } = filters;
  const mode = prisma.getQueryMode();
  const { client } = prisma;

  const where: Prisma.TeamWhereInput = {
    ...(userId && {
      teamUser: {
        some: { userId },
      },
    }),
    ...(query && {
      AND: {
        OR: [
          {
            name: { startsWith: query, mode },
          },
          {
            teamUser: {
              some: {
                role: ROLES.teamOwner,
                user: {
                  username: {
                    startsWith: query,
                    mode,
                  },
                },
              },
            },
          },
        ],
      },
    }),
  };

  const [pageFilters, getParameters] = prisma.getPageFilters({
    orderBy: 'name',
    ...filters,
  });

  const teams = await client.team.findMany({
    where: {
      ...where,
    },
    ...pageFilters,
    ...(options?.include && { include: options?.include }),
  });

  const count = await client.team.count({ where });

  return { data: teams, count, ...getParameters };
}

export async function getTeamsByUserId(
  userId: string,
  filter?: TeamSearchFilter,
): Promise<FilterResult<Team[]>> {
  return getTeams(
    { userId, ...filter },
    {
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
          select: { website: true, teamUser: true },
        },
      },
    },
  );
}
