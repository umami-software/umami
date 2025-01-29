import { getClient, redisEnabled } from '@umami/redis-client';
import { ok } from 'lib/response';

export async function POST(request: Request) {
  if (redisEnabled) {
    const redis = getClient();

    const token = request.headers.get('authorization')?.split(' ')?.[1];

    await redis.del(token);
  }

  return ok();
}
