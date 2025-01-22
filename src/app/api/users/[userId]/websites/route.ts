import { z } from 'zod';
import { unauthorized, json, badRequest } from 'lib/response';
import { getUserWebsites } from 'queries/prisma/website';
import { pagingParams } from 'lib/schema';
import { checkRequest } from 'lib/request';
import { checkAuth } from 'lib/auth';

const schema = z.object({
  ...pagingParams,
});

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { userId } = await params;
  const auth = await checkAuth(request);

  if (!auth || (!auth.user.isAdmin && auth.user.id !== userId)) {
    return unauthorized();
  }

  const websites = await getUserWebsites(userId, query);

  return json(websites);
}
