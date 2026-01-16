import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import { getEntity } from '@/lib/entity';
import type { Auth } from '@/lib/types';
import { getTeamUser } from '@/queries/prisma';

export async function canViewEntity({ user }: Auth, entityId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (entity.userId) {
    return user.id === entity.userId;
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canUpdateEntity({ user }: Auth, entityId: string) {
  if (user.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (entity.userId) {
    return user.id === entity.userId;
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteEntity({ user }: Auth, entityId: string) {
  if (user.isAdmin) {
    return true;
  }

  const entity = await getEntity(entityId);

  if (entity.userId) {
    return user.id === entity.userId;
  }

  if (entity.teamId) {
    const teamUser = await getTeamUser(entity.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
