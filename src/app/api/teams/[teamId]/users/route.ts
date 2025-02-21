import { z } from 'zod';
import { unauthorized, json, badRequest } from '@/lib/response';
import { canAddUserToTeam, canViewTeam } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { pagingParams, roleParam } from '@/lib/schema';
import { createTeamUser, getTeamUser, getTeamUsers } from '@/queries';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  const users = await getTeamUsers(
    {
      where: {
        teamId,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
    query,
  );

  return json(users);
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    userId: z.string().uuid(),
    role: roleParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canAddUserToTeam(auth))) {
    return unauthorized();
  }

  const { userId, role } = body;

  const teamUser = await getTeamUser(teamId, userId);

  if (teamUser) {
    return badRequest('User is already a member of the Team.');
  }

  const users = await createTeamUser(userId, teamId, role);

  return json(users);
}
