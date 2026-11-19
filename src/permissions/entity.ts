import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getEntity } from '@/lib/entity';
import { getBillingAccess, getEntityBillingScope } from '@/lib/load';
import type { Auth } from '@/lib/types';
import { getTeamUser } from '@/queries/prisma';

async function hasEntityBillingAccess(entity: Awaited<ReturnType<typeof getEntity>>) {
  return !!entity && !(await getBillingAccess(await getEntityBillingScope(entity))).isPastDue;
}

export async function canViewEntity({ user }: Auth, entityId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (!entity) {
    return false;
  }

  if (entity.userId) {
    return user.id === entity.userId && (await hasEntityBillingAccess(entity));
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return !!teamUser && (await hasEntityBillingAccess(entity));
  }

  return false;
}

export async function canUpdateEntity({ user }: Auth, entityId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (!entity) {
    return false;
  }

  if (entity.userId) {
    return user.id === entity.userId && (await hasEntityBillingAccess(entity));
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return (
      !!teamUser &&
      (await hasEntityBillingAccess(entity)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteUpdate)
    );
  }

  return false;
}

export async function canDeleteEntity({ user }: Auth, entityId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (!entity) {
    return false;
  }

  if (entity.userId) {
    return user.id === entity.userId && (await hasEntityBillingAccess(entity));
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return (
      !!teamUser &&
      (await hasEntityBillingAccess(entity)) &&
      hasPermission(teamUser.role, PERMISSIONS.websiteDelete)
    );
  }

  return false;
}
