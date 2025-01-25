import { z } from 'zod';
import { unauthorized, json, badRequest, ok } from 'lib/response';
import { canDeleteTeam, canUpdateTeam, checkAuth } from 'lib/auth';
import { checkRequest } from 'lib/request';
import { deleteTeam, getTeamUser, updateTeamUser } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const { teamId, userId } = await params;

  const auth = await checkAuth(request);

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  const teamUser = await getTeamUser(teamId, userId);

  return json(teamUser);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const schema = z.object({
    role: z.string().regex(/team-member|team-view-only|team-manager/),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { teamId, userId } = await params;

  const auth = await checkAuth(request);

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  const teamUser = await getTeamUser(teamId, userId);

  if (!teamUser) {
    return badRequest('The User does not exists on this team.');
  }

  const user = await updateTeamUser(teamUser.id, body);

  return json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canDeleteTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  await deleteTeam(teamId);

  return ok();
}
