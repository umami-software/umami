import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { ok } from '@/lib/response';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (redis.enabled && auth?.authKey) {
    await redis.client.del(auth.authKey);
  }

  return ok();
}
