import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { pagingParams, reportTypeParam } from '@/lib/schema';
import { parseRequest } from '@/lib/request';
import { canViewTeam, canViewWebsite, canUpdateWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { getReports, createReport } from '@/queries';

export async function GET(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
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

export async function POST(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    name: z.string().max(200),
    type: reportTypeParam,
    description: z.string().max(500),
    parameters: z.object({}).passthrough(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, type, name, description, parameters } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await createReport({
    id: uuid(),
    userId: auth.user.id,
    websiteId,
    type,
    name,
    description,
    parameters: JSON.stringify(parameters),
  } as any);

  return json(result);
}
