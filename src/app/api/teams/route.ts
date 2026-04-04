import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';
import { fetchAccount } from '@/lib/load';
import redis from '@/lib/redis';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams } from '@/lib/schema';
import { canCreateTeam } from '@/permissions';
import { createTeam, getUserTeams } from '@/queries/prisma';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const teams = await getUserTeams(auth.user.id, filters);

  return json(teams);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(50),
    ownerId: z.uuid().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canCreateTeam(auth))) {
    return unauthorized();
  }

  const { name, ownerId } = body;

  const teamId = uuid();
  const teamOwnerId = ownerId ?? auth.user.id;

  const team = await createTeam(
    {
      id: teamId,
      name,
      accessCode: `team_${getRandomChars(16)}`,
    },
    teamOwnerId,
  );

  if (process.env.CLOUD_MODE && redis.enabled) {
    const account = await fetchAccount(teamOwnerId);

    if (account) {
      await redis.client.set(
        `team:${teamId}`,
        {
          teamOwnerId,
          isPro: account.isPro || false,
          isBusiness: account.isBusiness || false,
          isNoBilling: account.isNoBilling || false,
          hasSubscription: account.hasSubscription || false,
        },
        60 * 60 * 24 * 90,
      );
    }
  }

  return json(team);
}
