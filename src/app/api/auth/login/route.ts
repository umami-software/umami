import { z } from 'zod';
import { saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { createSecureToken } from '@/lib/jwt';
import { checkPassword } from '@/lib/password';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getAllUserTeams, getUserByUsername } from '@/queries/prisma';

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
    return unauthorized({ code: 'incorrect-username-password' });
  }

  const { id, role, createdAt } = user;

  // Bind token to password hash so a password change invalidates old tokens.
  const pwd = hash(user.password);

  let token: string;

  if (redis.enabled) {
    token = await saveAuth({ userId: id, role, pwd });
  } else {
    token = createSecureToken({ userId: user.id, role, pwd }, secret());
  }

  const teams = await getAllUserTeams(id);

  return json({
    token,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
