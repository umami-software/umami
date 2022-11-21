import { Prisma, Team } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createTeam(
  data: Prisma.TeamCreateInput,
  searchDeleted = false,
): Promise<Team> {
  return prisma.client.team.create({
    data: { ...data, isDeleted: searchDeleted ? null : false },
  });
}

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

export async function getTeamsByUserId(userId: string): Promise<Team[]> {
  return prisma.client.teamUser
    .findMany({
      where: {
        userId,
      },
      include: {
        team: true,
      },
    })
    .then(data => {
      return data.map(a => a.team);
    });
}

export async function updateTeam(
  data: Prisma.TeamUpdateInput,
  where: Prisma.TeamWhereUniqueInput,
): Promise<Team> {
  return prisma.client.team.update({
    data,
    where,
  });
}

export async function deleteTeam(teamId: string): Promise<Team> {
  return prisma.client.team.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: teamId,
    },
  });
}
