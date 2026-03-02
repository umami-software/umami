import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createBoard, getUserBoards } from '@/queries/prisma';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const boards = await getUserBoards(auth.user.id, filters);

  return json(boards);
}

export async function POST(request: Request) {
  const schema = z.object({
    type: z.string(),
    name: z.string().max(100),
    description: z.string().max(500).optional(),
    slug: z.string().max(100),
    userId: z.uuid().nullable().optional(),
    teamId: z.uuid().nullable().optional(),
    parameters: z.object({ websiteId: z.uuid().optional() }).passthrough().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = body;

  if ((teamId && !(await canCreateTeamWebsite(auth, teamId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data = {
    ...body,
    id: uuid(),
    parameters: body.parameters ?? {},
    slug: uuid(),
    userId: !teamId ? auth.user.id : undefined,
  };

  const result = await createBoard(data);

  return json(result);
}
