import { z } from 'zod';
import { unauthorized, json, badRequest, notFound, ok } from 'lib/response';
import { canDeleteTeam, canUpdateTeam, canViewTeam, checkAuth } from 'lib/auth';
import { checkRequest } from 'lib/request';
import { deleteTeam, getTeam, updateTeam } from 'queries';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    teamId: z.string().uuid(),
  });

  const { error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { teamId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const team = await getTeam(teamId, { includeMembers: true });

  if (!team) {
    return notFound('Team not found.');
  }

  return json(team);
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    name: z.string().max(50),
    accessCode: z.string().max(50),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { teamId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canUpdateTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  const team = await updateTeam(teamId, body);

  return json(team);
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
