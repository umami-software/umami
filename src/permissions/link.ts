import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getBillingAccess, getEntityBillingScope } from '@/lib/load';
import type { Auth } from '@/lib/types';
import { getLink, getTeamUser } from '@/queries/prisma';

async function hasLinkBillingAccess(link: Awaited<ReturnType<typeof getLink>>) {
  return !!link && !(await getBillingAccess(await getEntityBillingScope(link))).isPastDue;
}

export async function canViewLink({ user, shareToken }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (
    shareToken?.linkId === linkId ||
    shareToken?.websiteId === linkId ||
    shareToken?.linkIds?.includes(linkId)
  ) {
    return true;
  }

  if (!user) {
    return false;
  }

  const link = await getLink(linkId);

  if (!link) {
    return false;
  }

  if (link.userId) {
    return user.id === link.userId && (await hasLinkBillingAccess(link));
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return !!teamUser && (await hasLinkBillingAccess(link));
  }

  return false;
}

export async function canUpdateLink({ user }: Auth, linkId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (!link) {
    return false;
  }

  if (link.userId) {
    return user.id === link.userId && (await hasLinkBillingAccess(link));
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return (
      !!teamUser &&
      (await hasLinkBillingAccess(link)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteUpdate)
    );
  }

  return false;
}

export async function canDeleteLink({ user }: Auth, linkId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (!link) {
    return false;
  }

  if (link.userId) {
    return user.id === link.userId && (await hasLinkBillingAccess(link));
  }

  if (link.teamId) {
    const teamUser = await getTeamUser(link.teamId, user.id);

    return (
      !!teamUser &&
      (await hasLinkBillingAccess(link)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteDelete)
    );
  }

  return false;
}
