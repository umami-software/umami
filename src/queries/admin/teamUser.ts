import { TeamUser } from '@prisma/client';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';
import { FilterResult, TeamUserSearchFilter } from 'lib/types';

export async function getTeamUser(teamId: string, userId: string): Promise<TeamUser> {
  return prisma.client.teamUser.findFirst({
    where: {
      teamId,
      userId,
    },
  });
}

export async function getTeamUsers(
  teamId: string,
  filters?: TeamUserSearchFilter,
): Promise<FilterResult<TeamUser[]>> {
  return prisma.pagedQuery(
    'teamUser',
    {
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
    filters,
  );
}

export async function createTeamUser(
  userId: string,
  teamId: string,
  role: string,
): Promise<TeamUser> {
  return prisma.client.teamUser.create({
    data: {
      id: uuid(),
      userId,
      teamId,
      role,
    },
  });
}

export async function deleteTeamUser(teamId: string, userId: string): Promise<TeamUser> {
  const { client } = prisma;

  return client.teamUser.deleteMany({
    where: {
      teamId,
      userId,
    },
  });
}
