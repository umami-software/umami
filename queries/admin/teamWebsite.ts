import { TeamWebsite, Prisma, Website, Team, User } from '@prisma/client';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import prisma from 'lib/prisma';

export async function getTeamWebsite(teamWebsiteId: string): Promise<
  TeamWebsite & {
    website: Website;
  }
> {
  return prisma.client.teamWebsite.findFirst({
    where: {
      id: teamWebsiteId,
    },
    include: {
      website: true,
    },
  });
}

export async function getTeamWebsiteByTeamMemberId(
  websiteId: string,
  userId: string,
): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.findFirst({
    where: {
      websiteId,
      team: {
        teamUser: {
          some: {
            userId,
          },
        },
      },
    },
  });
}

export async function getTeamWebsites(teamId: string): Promise<
  (TeamWebsite & {
    team: Team;
    website: Website & {
      user: User;
    };
  })[]
> {
  return prisma.client.teamWebsite.findMany({
    where: {
      teamId,
    },
    include: {
      team: {
        include: {
          teamUser: {
            where: {
              role: ROLES.teamOwner,
            },
          },
        },
      },
      website: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      {
        team: {
          name: 'asc',
        },
      },
    ],
  });
}

export async function createTeamWebsite(teamId: string, websiteId: string): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.create({
    data: {
      id: uuid(),
      teamId,
      websiteId,
    },
  });
}

export async function createTeamWebsites(teamId: string, websiteIds: string[]) {
  const currentTeamWebsites = await getTeamWebsites(teamId);

  // filter out websites that already exists on the team
  const addWebsites = websiteIds.filter(
    websiteId => !currentTeamWebsites.some(a => a.websiteId === websiteId),
  );

  const teamWebsites: Prisma.TeamWebsiteCreateManyInput[] = addWebsites.map(a => {
    return {
      id: uuid(),
      teamId,
      websiteId: a,
    };
  });

  return prisma.client.teamWebsite.createMany({
    data: teamWebsites,
  });
}

export async function deleteTeamWebsite(teamWebsiteId: string): Promise<TeamWebsite> {
  return prisma.client.teamWebsite.delete({
    where: {
      id: teamWebsiteId,
    },
  });
}
