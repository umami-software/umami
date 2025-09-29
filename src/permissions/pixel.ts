import { Auth } from '@/lib/types';
import { getPixel, getTeamUser } from '@/queries/prisma';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';

export async function canViewPixel({ user }: Auth, pixelId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const pixel = await getPixel(pixelId);

  if (pixel.userId) {
    return user.id === pixel.userId;
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canUpdatePixel({ user }: Auth, pixelId: string) {
  if (user.isAdmin) {
    return true;
  }

  const pixel = await getPixel(pixelId);

  if (pixel.userId) {
    return user.id === pixel.userId;
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeletePixel({ user }: Auth, pixelId: string) {
  if (user.isAdmin) {
    return true;
  }

  const pixel = await getPixel(pixelId);

  if (pixel.userId) {
    return user.id === pixel.userId;
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
