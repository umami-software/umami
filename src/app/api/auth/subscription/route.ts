import { z } from 'zod';
import { fetchAccount, fetchTeam } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { normalizeSubscription } from '@/lib/subscription';
import { canViewTeam } from '@/permissions';

const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const schema = z.object({
    teamId: z.string().uuid().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = query;

  if (teamId && !(await canViewTeam(auth, teamId))) {
    return Response.json(
      {
        error: {
          message: 'Unauthorized',
          code: 'unauthorized',
          status: 401,
        },
      },
      { status: 401, headers },
    );
  }

  const account = teamId
    ? ((await fetchTeam(teamId)) ?? (await fetchAccount(auth.user.id)))
    : await fetchAccount(auth.user.id);

  return Response.json(normalizeSubscription(account), { headers });
}
