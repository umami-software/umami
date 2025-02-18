import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserTeams } from '@/queries';
import { unauthorized, json } from '@/lib/response';
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

  if (auth.user.id !== userId && !auth.user.isAdmin) {
    return unauthorized();
  }

  const teams = await getUserTeams(userId, query);

  return json(teams);
}
