import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, teamRoleParam } from '@/lib/schema';
import { canUpdateTeam, canViewTeam } from '@/permissions';
import { createTeamUser, getTeamUser, getTeamUsers } from '@/queries/prisma';
import { z } from 'zod';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be a member of this team.' });
  }

  const filters = await getQueryFilters(query);

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
      orderBy: {
        createdAt: 'asc',
      },
    },
    filters,
  );

  return json(users);
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    userId: z.uuid(),
    role: teamRoleParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized({ message: 'You must be the owner/manager of this team.' });
  }

  const { userId, role } = body;

  const teamUser = await getTeamUser(teamId, userId);

  if (teamUser) {
    return badRequest({ message: 'User is already a member of the Team.' });
  }

  const users = await createTeamUser(userId, teamId, role);

  return json(users);
}
