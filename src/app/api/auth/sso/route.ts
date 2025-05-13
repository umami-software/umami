import redis from '@/lib/redis';
import { json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { saveAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (redis.enabled) {
    const token = await saveAuth({ userId: auth.user.id }, 86400);

    return json({ user: auth.user, token });
  }
}
