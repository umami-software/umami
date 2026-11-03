import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { canDeleteTeam, canUpdateTeam, canViewTeam, SHARE_SECTIONS } from '@/permissions';
import { deleteTeam, getTeam, updateTeam } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const team = await getTeam(teamId, { includeMembers: true });

  if (!team) {
    return notFound({ message: 'Team not found.' });
  }

  return json(team);
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    name: z.string().max(50).optional(),
    accessCode: z.string().max(50).optional(),
    viewOnlySections: z.array(z.enum(SHARE_SECTIONS)).nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  const { viewOnlySections, ...data } = body;

  const team = await updateTeam(teamId, {
    ...data,
    ...(viewOnlySections !== undefined && {
      viewOnlySections: viewOnlySections === null ? Prisma.DbNull : viewOnlySections,
    }),
  });

  return json(team);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canDeleteTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  await deleteTeam(teamId);

  return ok();
}
