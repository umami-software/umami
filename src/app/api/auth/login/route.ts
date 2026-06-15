import { z } from 'zod';
import { saveAuth, saveRefreshToken } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { secret, createRefreshToken } from '@/lib/crypto';
import { createSecureToken, getAccessExpiry, getRefreshExpiry, refreshTokensEnabled } from '@/lib/jwt';
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

  const teams = await getAllUserTeams(id);

  if (redis.enabled) {
    const token = await saveAuth({ userId: id, role });

    return json({
      token,
      user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
    });
  }

  // auth tokens live forever unless refresh tokens are enabled.
  const token = createSecureToken({ userId: user.id, role }, secret(), { expiresIn: getAccessExpiry() });

  if (!refreshTokensEnabled()) {
    return json({
      token,
      user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
    })
  }

  const refreshToken = createRefreshToken();

  await saveRefreshToken(id, refreshToken);

  return json({
    token,
    refreshToken,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
