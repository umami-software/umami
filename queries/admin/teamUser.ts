import { Prisma, TeamUser } from '@prisma/client';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';

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

export async function getTeamUser(where: Prisma.TeamUserWhereInput): Promise<TeamUser> {
  return prisma.client.teamUser.findFirst({
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
