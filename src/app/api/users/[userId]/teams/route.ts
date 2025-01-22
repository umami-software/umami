import { z } from 'zod';
import { pagingParams } from 'lib/schema';
import { getUserTeams } from 'queries';
import { checkAuth } from 'lib/auth';
import { unauthorized, badRequest, json } from 'lib/response';
import { checkRequest } from 'lib/request';

const schema = z.object({
  ...pagingParams,
});

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth || (!auth.user.isAdmin && (!userId || auth.user.id !== userId))) {
    return unauthorized();
  }

  const teams = await getUserTeams(userId, query);

  return json(teams);
}
