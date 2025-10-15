import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { pagingParams, reportSchema, reportTypeParam } from '@/lib/schema';
import { parseRequest } from '@/lib/request';
import { canViewWebsite, canUpdateWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { getReports, createReport } from '@/queries/prisma';

export async function GET(request: Request) {
  const schema = z.object({
    websiteId: z.uuid(),
    type: reportTypeParam.optional(),
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { page, search, pageSize, websiteId, type } = query;
  const filters = {
    page,
    pageSize,
    search,
  };

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getReports(
    {
      where: {
        websiteId,
        type,
        website: {
          deletedAt: null,
        },
      },
    },
    filters,
  );

  return json(data);
}

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportSchema);

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
    description: description || '',
    parameters,
  });

  return json(result);
}
