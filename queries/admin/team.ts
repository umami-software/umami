import { Prisma, Team, TeamWebsite } from '@prisma/client';
import prisma from 'lib/prisma';
import { uuid } from 'lib/crypto';
import { ROLES } from 'lib/constants';

export async function getTeam(where: Prisma.TeamWhereInput): Promise<Team> {
  return prisma.client.team.findFirst({
    where,
    include: {
      teamUser: true,
    },
  });
}

export async function getTeams(where: Prisma.TeamWhereInput): Promise<Team[]> {
  return prisma.client.team.findMany({
    where,
  });
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
