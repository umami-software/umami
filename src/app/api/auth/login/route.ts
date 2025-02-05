import { z } from 'zod';
import { checkPassword } from '@/lib/auth';
import { createSecureToken } from '@/lib/jwt';
import { redisEnabled } from '@umami/redis-client';
import { getUserByUsername } from '@/queries';
import { json, unauthorized } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { saveAuth } from '@/lib/auth';
import { secret } from '@/lib/crypto';
import { ROLES } from '@/lib/constants';

export async function POST(request: Request) {
  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return error();
  }

  const { username, password } = body;

  const user = await getUserByUsername(username, { includePassword: true });

  if (!user || !checkPassword(password, user.password)) {
    return unauthorized();
  }

  if (redisEnabled) {
    const token = await saveAuth({ userId: user.id });

    return json({ token, user });
  }

  const token = createSecureToken({ userId: user.id }, secret());
  const { id, role, createdAt } = user;

  return json({
    token,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin },
  });
}
