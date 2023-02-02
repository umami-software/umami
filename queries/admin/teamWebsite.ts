import { TeamWebsite } from '@prisma/client';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';

export async function getTeamWebsite(teamId: string, userId: string): Promise<TeamWebsite> {
  return prisma.client.TeamWebsite.findFirst({
    where: {
      teamId,
      userId,
    },
  });
}

export async function getTeamWebsites(teamId: string): Promise<TeamWebsite[]> {
  return prisma.client.TeamWebsite.findMany({
    where: {
      teamId,
    },
    include: {
      user: true,
      website: true,
    },
  });
}

export async function createTeamWebsite(
  userId: string,
  teamId: string,
  websiteId: string,
): Promise<TeamWebsite> {
  return prisma.client.TeamWebsite.create({
    data: {
      id: uuid(),
      userId,
      teamId,
      websiteId,
    },
  });
}

export async function deleteTeamWebsite(TeamWebsiteId: string): Promise<TeamWebsite> {
  return prisma.client.teamUser.delete({
    where: {
      id: TeamWebsiteId,
    },
  });
}
