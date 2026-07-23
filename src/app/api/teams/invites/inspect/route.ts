import { z } from 'zod';
import { getIpAddress } from '@/lib/ip';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { badRequest, json, tooManyRequests, withNoStore } from '@/lib/response';
import { hashTeamInviteToken } from '@/lib/team-invite';
import { inspectTeamInvite } from '@/queries/prisma';

const noStore = withNoStore;

export async function POST(request: Request) {
  const schema = z.object({
    token: z.string().min(1).max(512),
  });
  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return noStore(error());
  }

  if (redis.enabled) {
    const digest = hashTeamInviteToken(body.token);
    const ip = getIpAddress(request.headers);
    const limits = [redis.client.rateLimit(`team-invite:inspect:token:${digest}`, 31, 60)];

    if (ip) {
      limits.push(redis.client.rateLimit(`team-invite:inspect:ip:${ip}`, 61, 60));
    }

    if ((await Promise.all(limits)).some(Boolean)) {
      return noStore(tooManyRequests());
    }
  }

  const invite = await inspectTeamInvite(body.token);

  if (!invite) {
    return noStore(badRequest({ message: 'Invalid invitation.', code: 'INVALID_TEAM_INVITE' }));
  }

  return noStore(json(invite));
}
