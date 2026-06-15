import { z } from 'zod';
import { hash } from '@/lib/crypto';
import { refreshTokensEnabled } from '@/lib/jwt';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { badRequest, ok } from '@/lib/response';
import { revokeRefreshToken } from '@/lib/auth';
import { removeClientAuthToken, removeClientRefreshToken } from '@/lib/client';

export async function POST(request: Request) {
  const schema = z.object({
    refreshToken: z.string(),
  }).optional();

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (redis.enabled && auth?.authKey) {
    await redis.client.del(auth.authKey);
  }

  if (refreshTokensEnabled()) {
    if (!body) {
      return badRequest({ code: 'refresh-token-required' });
    }

    await revokeRefreshToken(body.refreshToken);
    removeClientAuthToken();
  }

  removeClientRefreshToken();

  return ok();
}
