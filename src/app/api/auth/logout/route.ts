import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { ok } from '@/lib/response';

export async function POST(request: Request) {
  const { error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (redis.enabled) {
    const token = request.headers.get('authorization')?.split(' ')?.[1];

    await redis.client.del(token);
  }

  return ok();
}
