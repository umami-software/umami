import { Prisma, Team } from '@prisma/client';
import prisma from 'lib/prisma';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';

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
