import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getBillingAccess, getEntityBillingScope } from '@/lib/load';
import type { Auth } from '@/lib/types';
import { getPixel, getTeamUser } from '@/queries/prisma';

async function hasPixelBillingAccess(pixel: Awaited<ReturnType<typeof getPixel>>) {
  return !!pixel && !(await getBillingAccess(await getEntityBillingScope(pixel))).isPastDue;
}

export async function canViewPixel({ user, shareToken }: Auth, pixelId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (
    shareToken?.pixelId === pixelId ||
    shareToken?.websiteId === pixelId ||
    shareToken?.pixelIds?.includes(pixelId)
  ) {
    return true;
  }

  if (!user) {
    return false;
  }

  const pixel = await getPixel(pixelId);

  if (!pixel) {
    return false;
  }

  if (pixel.userId) {
    return user.id === pixel.userId && (await hasPixelBillingAccess(pixel));
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return !!teamUser && (await hasPixelBillingAccess(pixel));
  }

  return false;
}

export async function canUpdatePixel({ user }: Auth, pixelId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const pixel = await getPixel(pixelId);

  if (!pixel) {
    return false;
  }

  if (pixel.userId) {
    return user.id === pixel.userId && (await hasPixelBillingAccess(pixel));
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return (
      !!teamUser &&
      (await hasPixelBillingAccess(pixel)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteUpdate)
    );
  }

  return false;
}

export async function canDeletePixel({ user }: Auth, pixelId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const pixel = await getPixel(pixelId);

  if (!pixel) {
    return false;
  }

  if (pixel.userId) {
    return user.id === pixel.userId && (await hasPixelBillingAccess(pixel));
  }

  if (pixel.teamId) {
    const teamUser = await getTeamUser(pixel.teamId, user.id);

    return (
      !!teamUser &&
      (await hasPixelBillingAccess(pixel)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteDelete)
    );
  }

  return false;
}
