import { Prisma, Team } from '@prisma/client';
import { ROLES, TEAM_FILTER_TYPES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';
import { FilterResult, TeamSearchFilter } from 'lib/types';

export interface GetTeamOptions {
  includeTeamUser?: boolean;
}

async function getTeam(where: Prisma.TeamWhereInput, options: GetTeamOptions = {}): Promise<Team> {
  const { includeTeamUser = false } = options;

  return prisma.client.team.findFirst({
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

export async function createTeam(data: Prisma.TeamCreateInput, userId: string): Promise<Team> {
  const { id } = data;

  return prisma.transaction([
    prisma.client.team.create({
      data,
    }),
    prisma.client.teamUser.create({
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
  return prisma.client.team.update({
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

  return transaction([
    client.teamWebsite.deleteMany({
      where: {
        teamId,
      },
    }),
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
  TeamSearchFilter: TeamSearchFilter,
  options?: { include?: Prisma.TeamInclude },
): Promise<FilterResult<Team[]>> {
  const { userId, filter, filterType = TEAM_FILTER_TYPES.all } = TeamSearchFilter;
  const mode = prisma.getSearchMode();

  const where: Prisma.TeamWhereInput = {
    ...(userId && {
      teamUser: {
        some: { userId },
      },
    }),
    ...(filter && {
      AND: {
        OR: [
          {
            ...((filterType === TEAM_FILTER_TYPES.all || filterType === TEAM_FILTER_TYPES.name) && {
              name: { startsWith: filter, ...mode },
            }),
          },
          {
            ...((filterType === TEAM_FILTER_TYPES.all ||
              filterType === TEAM_FILTER_TYPES['user:username']) && {
              teamUser: {
                some: {
                  role: ROLES.teamOwner,
                  user: {
                    username: {
                      startsWith: filter,
                      ...mode,
                    },
                  },
                },
              },
            }),
          },
        ],
      },
    }),
  };

  const [pageFilters, getParameters] = prisma.getPageFilters({
    orderBy: 'name',
    ...TeamSearchFilter,
  });

  const teams = await prisma.client.team.findMany({
    where: {
      ...where,
    },
    ...pageFilters,
    ...(options?.include && { include: options?.include }),
  });

  const count = await prisma.client.team.count({ where });

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
      },
    },
  );
}
