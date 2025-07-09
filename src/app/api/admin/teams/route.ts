import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canViewAllTeams } from '@/lib/auth';
import { getTeams } from '@/queries/prisma/team';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewAllTeams(auth))) {
    return unauthorized();
  }

  const teams = await getTeams(
    {
      include: {
        _count: {
          select: {
            teamUser: true,
            website: true,
          },
        },
        teamUser: {
          select: {
            user: {
              omit: {
                password: true,
              },
            },
          },
          where: {
            role: 'team-owner',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    query,
  );

  return json(teams);
}
