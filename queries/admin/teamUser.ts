import { Prisma, TeamUser } from '@prisma/client';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';

export async function getTeamUser(teamId: string, userId: string): Promise<TeamUser> {
  return prisma.client.teamUser.findFirst({
    where: {
      teamId,
      userId,
    },
  });
}

export async function getTeamUsers(teamId: string): Promise<TeamUser[]> {
  return prisma.client.teamUser.findMany({
    where: {
      teamId,
    },
    include: {
      user: true,
    },
  });
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
  return prisma.client.teamUser.delete({
    where: {
      id: teamUserId,
    },
  });
}

export async function deleteTeamUserByUserId(
  userId: string,
  teamId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.client.teamUser.deleteMany({
    where: {
      userId,
      teamId,
    },
  });
}
