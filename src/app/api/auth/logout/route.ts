import redis from '@/lib/redis';
import { ok } from '@/lib/response';

export async function POST(request: Request) {
  if (redis.enabled) {
    const token = request.headers.get('authorization')?.split(' ')?.[1];

    await redis.client.del(token);
  }

  return ok();
}
