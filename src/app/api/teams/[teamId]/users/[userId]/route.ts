import { canDeleteTeamUser, canUpdateTeam } from '@/permissions';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, unauthorized } from '@/lib/response';
import { deleteTeamUser, getTeamUser, updateTeamUser } from '@/queries/prisma';
import { z } from 'zod';
import { teamRoleParam } from '@/lib/schema';

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

  await deleteTeamUser(teamId, userId);

  return ok();
}
