import { Prisma, Team, TeamUser } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createTeam(data: Prisma.TeamCreateInput): Promise<Team> {
  return prisma.client.role.create({
    data,
  });
}

export async function getTeam(where: Prisma.TeamWhereUniqueInput): Promise<Team> {
  return prisma.client.role.findUnique({
    where,
  });
}

export async function getTeams(where: Prisma.TeamWhereInput): Promise<Team[]> {
  return prisma.client.role.findMany({
    where,
  });
}

export async function getTeamsByUserId(userId: string): Promise<
  (TeamUser & {
    team: Team;
  })[]
> {
  return prisma.client.teamUser.findMany({
    where: {
      userId,
    },
    include: {
      team: true,
    },
  });
}

export async function updateTeam(
  data: Prisma.TeamUpdateInput,
  where: Prisma.TeamWhereUniqueInput,
): Promise<Team> {
  return prisma.client.role.update({
    data,
    where,
  });
}

export async function deleteTeam(teamId: string): Promise<Team> {
  return prisma.client.role.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: teamId,
    },
  });
}
