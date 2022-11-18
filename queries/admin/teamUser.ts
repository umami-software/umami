import { Prisma, TeamUser } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createTeamUser(data: Prisma.TeamUserCreateInput): Promise<TeamUser> {
  return prisma.client.teamUser.create({
    data,
  });
}

export async function getTeamUser(where: Prisma.TeamUserWhereUniqueInput): Promise<TeamUser> {
  return prisma.client.teamUser.findUnique({
    where,
  });
}

export async function getTeamUsers(where: Prisma.TeamUserWhereInput): Promise<TeamUser[]> {
  return prisma.client.teamUser.findMany({
    where,
  });
}

export async function updateTeamUser(
  data: Prisma.TeamUserUpdateInput,
  where: Prisma.TeamUserWhereUniqueInput,
): Promise<TeamUser> {
  return prisma.client.teamUser.update({
    data,
    where,
  });
}

export async function deleteTeamUser(teamUserId: string): Promise<TeamUser> {
  return prisma.client.teamUser.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: teamUserId,
    },
  });
}
