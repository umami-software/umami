import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canViewAllWebsites } from '@/permissions';
import { getWebsites } from '@/queries/prisma/website';
import { ROLES } from '@/lib/constants';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewAllWebsites(auth))) {
    return unauthorized();
  }

  const websites = await getWebsites(
    {
      include: {
        user: {
          where: {
            deletedAt: null,
          },
          select: {
            username: true,
            id: true,
          },
        },
        team: {
          where: {
            deletedAt: null,
          },
          include: {
            members: {
              where: {
                role: ROLES.teamOwner,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    query,
  );

  return json(websites);
}
