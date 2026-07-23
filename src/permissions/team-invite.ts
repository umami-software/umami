import { ROLES } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getTeamUser } from '@/queries/prisma/teamUser';

const INVITE_ISSUER_ROLES: Record<string, true> = {
  [ROLES.teamOwner]: true,
  [ROLES.teamManager]: true,
};
const INVITABLE_TEAM_ROLES: Record<string, true> = {
  [ROLES.teamMember]: true,
  [ROLES.teamViewOnly]: true,
};

export function canGrantTeamInviteRole(actorRole: string, invitedRole: string) {
  return !!INVITE_ISSUER_ROLES[actorRole] && !!INVITABLE_TEAM_ROLES[invitedRole];
}

export function isTeamInviteRole(role: string) {
  return !!INVITABLE_TEAM_ROLES[role];
}

export async function canIssueTeamInvite({ user }: Auth, teamId: string, invitedRole: string) {
  if (!user || !isTeamInviteRole(invitedRole)) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const teamUser = await getTeamUser(teamId, user.id);

  return !!teamUser && canGrantTeamInviteRole(teamUser.role, invitedRole);
}
