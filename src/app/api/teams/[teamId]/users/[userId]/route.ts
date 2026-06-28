import { z } from 'zod';
import { ROLES, TEAM_ROLE_RANK } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, unauthorized } from '@/lib/response';
import { teamRoleParam } from '@/lib/schema';
import { canDeleteTeamUser, canUpdateTeam } from '@/permissions';
import { deleteTeamUser, getTeamUser, updateTeamUser } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId, userId } = await params;

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  const teamUser = await getTeamUser(teamId, userId);

  return json(teamUser);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const schema = z.object({
    role: teamRoleParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId, userId } = await params;

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  const teamUser = await getTeamUser(teamId, userId);

  if (!teamUser) {
    return badRequest({ message: 'The User does not exists on this team.' });
  }

  // Server-side rank check: actor must outrank target to modify their role.
  if (!auth.user.isAdmin) {
    const actorTeamUser = await getTeamUser(teamId, auth.user.id);
    const actorRank = TEAM_ROLE_RANK[actorTeamUser?.role] ?? -1;
    const targetRank = TEAM_ROLE_RANK[teamUser.role] ?? -1;

    if (actorRank <= targetRank) {
      return unauthorized({ message: 'You do not have permission to modify this user.' });
    }
  }

  const user = await updateTeamUser(teamUser.id, body);

  return json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId, userId } = await params;

  if (!(await canDeleteTeamUser(auth, teamId, userId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  const teamUser = await getTeamUser(teamId, userId);

  if (!teamUser) {
    return badRequest({ message: 'The User does not exists on this team.' });
  }

  if (!auth.user.isAdmin && teamUser.role === ROLES.teamOwner) {
    return unauthorized({ message: 'You do not have permission to remove this user.' });
  }

  // Server-side rank check: actor must outrank target to remove them.
  if (!auth.user.isAdmin && userId !== auth.user.id) {
    const actorTeamUser = await getTeamUser(teamId, auth.user.id);
    const actorRank = TEAM_ROLE_RANK[actorTeamUser?.role] ?? -1;
    const targetRank = TEAM_ROLE_RANK[teamUser.role] ?? -1;

    if (actorRank <= targetRank) {
      return unauthorized({ message: 'You do not have permission to remove this user.' });
    }
  }

  await deleteTeamUser(teamId, userId);

  return ok();
}
