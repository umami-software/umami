import { z } from 'zod';
import { pagingParams } from 'lib/schema';
import { parseRequest } from 'lib/request';
import { canViewTeam, canViewWebsite } from 'lib/auth';
import { unauthorized, json } from 'lib/response';
import { getReports } from 'queries/prisma/report';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { page, search, pageSize, websiteId, teamId } = query;
  const userId = auth.user.id;
  const filters = {
    page,
    pageSize,
    search,
  };

  if (
    (websiteId && !(await canViewWebsite(auth, websiteId))) ||
    (teamId && !(await canViewTeam(auth, teamId)))
  ) {
    return unauthorized();
  }

  const data = await getReports(
    {
      where: {
        OR: [
          ...(websiteId ? [{ websiteId }] : []),
          ...(teamId
            ? [
                {
                  website: {
                    deletedAt: null,
                    teamId,
                  },
                },
              ]
            : []),
          ...(userId && !websiteId && !teamId
            ? [
                {
                  website: {
                    deletedAt: null,
                    userId,
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        website: {
          select: {
            domain: true,
          },
        },
      },
    },
    filters,
  );

  return json(data);
}
