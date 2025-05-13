import { z } from 'zod';
import { unauthorized, json } from '@/lib/response';
import { getUserWebsites } from '@/queries/prisma/website';
import { pagingParams } from '@/lib/schema';
import { parseRequest } from '@/lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!auth.user.isAdmin && auth.user.id !== userId) {
    return unauthorized();
  }

  const websites = await getUserWebsites(userId, query);

  return json(websites);
}
