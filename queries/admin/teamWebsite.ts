import { Prisma, TeamWebsite } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createTeamWebsite(
  data: Prisma.TeamWebsiteCreateInput | Prisma.TeamWebsiteUncheckedCreateInput,
): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.create({
    data,
  });
}

export async function getTeamWebsite(
  where: Prisma.TeamWebsiteWhereUniqueInput,
): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.findUnique({
    where,
  });
}

export async function getTeamWebsites(where: Prisma.TeamWebsiteWhereInput): Promise<TeamWebsite[]> {
  return prisma.client.teamWebsite.findMany({
    where,
  });
}

export async function updateTeamWebsite(
  data: Prisma.TeamWebsiteUpdateInput,
  where: Prisma.TeamWebsiteWhereUniqueInput,
): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.update({
    data,
    where,
  });
}

export async function deleteTeamWebsite(teamWebsiteId: string): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: teamWebsiteId,
    },
  });
}
