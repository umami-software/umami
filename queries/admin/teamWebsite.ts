import { TeamWebsite } from '@prisma/client';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';

export async function getTeamWebsite(teamId: string, userId: string): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.findFirst({
    where: {
      teamId,
      userId,
    },
  });
}

export async function getTeamWebsites(teamId: string): Promise<TeamWebsite[]> {
  return prisma.client.teamWebsite.findMany({
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
  return prisma.client.teamWebsite.create({
    data: {
      id: uuid(),
      userId,
      teamId,
      websiteId,
    },
  });
}
