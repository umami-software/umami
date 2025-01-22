import { z } from 'zod';
import { pagingParams } from 'lib/schema';
import { getUserTeams } from 'queries';
import { checkAuth } from 'lib/auth';
import { unauthorized, badRequest, json } from 'lib/response';
import { checkRequest } from 'lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { userId } = await params;

  const auth = await checkAuth(request);

  if (!auth || (!auth.user.isAdmin && (!userId || auth.user.id !== userId))) {
    return unauthorized();
  }

  const teams = await getUserTeams(userId, query);

  return json(teams);
}
