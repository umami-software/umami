import { Prisma, Team } from '@prisma/client';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import { ROLES } from 'lib/constants';
import { Website } from 'lib/types';

export async function getTeam(where: Prisma.TeamWhereInput): Promise<Team> {
  return prisma.client.team.findFirst({
    where,
  });
}

export async function getTeams(where: Prisma.TeamWhereInput): Promise<Team[]> {
  return prisma.client.team.findMany({
    where,
  });
}

export async function getTeamWebsites(teamId: string): Promise<Website[]> {
  return prisma.client.website.findMany({
    where: {
      teamId,
    },
    orderBy: [
      {
        name: 'asc',
      },
    ],
  } as any);
}

export async function createTeam(data: Prisma.TeamCreateInput): Promise<Team> {
  const { id, userId } = data;

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

export async function updateTeam(
  data: Prisma.TeamUpdateInput,
  where: Prisma.TeamWhereUniqueInput,
): Promise<Team> {
  return prisma.client.team.update({
    data: {
      ...data,
      updatedAt: new Date(),
    },
    where,
  });
}

export async function deleteTeam(teamId: string): Promise<Team> {
  return prisma.client.team.update({
    data: {
      deletedAt: new Date(),
    },
    where: {
      id: teamId,
    },
  });
}
