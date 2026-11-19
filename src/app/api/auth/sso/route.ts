import { saveAuth } from '@/lib/auth';
import { hash } from '@/lib/crypto';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json, serverError } from '@/lib/response';
import { getUser } from '@/queries/prisma';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!redis.enabled) {
    return serverError('Redis is disabled');
  }

  const user = await getUser(auth.user.id, { includePassword: true });
  const token = await saveAuth({ userId: auth.user.id, pwd: hash(user.password) }, 86400);

  return json({ user: auth.user, token });
}
