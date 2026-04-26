import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getTeamUser } from '@/queries/prisma';

export async function canManageBillingProviderForUser({ user }: Auth, userId: string) {
  if (!user) {
    return false;
  }

  return user.isAdmin || user.id === userId;
}

export async function canManageBillingProviderForTeam({ user }: Auth, teamId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return teamUser && hasPermission(teamUser.role, PERMISSIONS.teamUpdate);
}
