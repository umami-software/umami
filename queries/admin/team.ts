import { Prisma, Role, Team, TeamUser } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createTeam(data: Prisma.RoleCreateInput): Promise<Role> {
  return prisma.client.role.create({
    data,
  });
}

export async function getTeam(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
  return prisma.client.role.findUnique({
    where,
  });
}

export async function getTeams(where: Prisma.RoleWhereInput): Promise<Role[]> {
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
  data: Prisma.RoleUpdateInput,
  where: Prisma.RoleWhereUniqueInput,
): Promise<Role> {
  return prisma.client.role.update({
    data,
    where,
  });
}

export async function deleteTeam(teamId: string): Promise<Role> {
  return prisma.client.role.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: teamId,
    },
  });
}
