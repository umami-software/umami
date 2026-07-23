import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getEntity } from '@/lib/entity';
import prisma from '@/lib/prisma';
import type { Auth } from '@/lib/types';
import { getTeamUser, getWebsite } from '@/queries/prisma';

export async function canViewWebsite({ user, shareToken }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (
    shareToken?.websiteId === websiteId ||
    shareToken?.pixelId === websiteId ||
    shareToken?.linkId === websiteId ||
    shareToken?.websiteIds?.includes(websiteId) ||
    shareToken?.pixelIds?.includes(websiteId) ||
    shareToken?.linkIds?.includes(websiteId)
  ) {
    return true;
  }

  const entity = await getEntity(websiteId);

  if (!entity || !user) {
    return false;
  }

  if (entity.userId) {
    return user.id === entity.userId;
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canViewBatchWebsites({ user, shareToken }: Auth, websiteIds: string[]) {
  if (!websiteIds.length) {
    return [];
  }

  const requestedIds = Array.from(new Set(websiteIds));

  if (user?.isAdmin) {
    return requestedIds;
  }

  const shareAllowedIds = new Set(
    [
      shareToken?.websiteId,
      shareToken?.pixelId,
      shareToken?.linkId,
      ...(shareToken?.websiteIds ?? []),
      ...(shareToken?.pixelIds ?? []),
      ...(shareToken?.linkIds ?? []),
    ].filter((id): id is string => Boolean(id)),
  );

  if (!user) {
    return requestedIds.filter(id => shareAllowedIds.has(id));
  }

  const websites = await prisma.client.website.findMany({
    where: {
      id: {
        in: requestedIds,
      },
    },
    select: {
      id: true,
      userId: true,
      teamId: true,
    },
  });

  const ownedIds = new Set(
    websites.filter(website => website.userId === user.id).map(website => website.id),
  );
  const teamIds = Array.from(
    new Set(websites.map(website => website.teamId).filter((teamId): teamId is string => Boolean(teamId))),
  );
  const teamUsers = teamIds.length
    ? await prisma.client.teamUser.findMany({
        where: {
          userId: user.id,
          teamId: {
            in: teamIds,
          },
        },
        select: {
          teamId: true,
        },
      })
    : [];
  const allowedTeamIds = new Set(teamUsers.map(teamUser => teamUser.teamId));
  const teamOwnedIds = new Set(
    websites
      .filter(website => website.teamId && allowedTeamIds.has(website.teamId))
      .map(website => website.id),
  );

  return requestedIds.filter(
    id => shareAllowedIds.has(id) || ownedIds.has(id) || teamOwnedIds.has(id),
  );
}

export async function canViewAllWebsites({ user }: Auth) {
  return user?.isAdmin ?? false;
}

export async function canCreateWebsite({ user }: Auth) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return hasPermission(user.role, PERMISSIONS.websiteCreate);
}

export async function canUpdateWebsite({ user }: Auth, websiteId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user.id === website.userId;
  }

  if (website.teamId) {
    const teamUser = await getTeamUser(website.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}

export async function canTransferWebsiteToUser({ user }: Auth, websiteId: string, userId: string) {
  if (!user) {
    return false;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.teamId && user.id === userId) {
    const teamUser = await getTeamUser(website.teamId, userId);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteTransferToUser);
  }

  return false;
}

export async function canTransferWebsiteToTeam({ user }: Auth, websiteId: string, teamId: string) {
  if (!user) {
    return false;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId && website.userId === user.id) {
    const teamUser = await getTeamUser(teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteTransferToTeam);
  }

  return false;
}
