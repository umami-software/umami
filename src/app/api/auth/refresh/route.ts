import { z } from 'zod';
import { saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { createSecureToken, getAccessExpiry, getRefreshExpiry, refreshTokensEnabled } from '@/lib/jwt';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { getAllUserTeams, getUser, getUserAuthSessionByRefreshHash, updateUserAuthSession } from '@/queries/prisma';
import { hash, createRefreshToken } from '@/lib/crypto';

export async function POST(request: Request) {
  const schema = z.object({
    refreshToken: z.string(),
  });

  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return error();
  }

  if (!refreshTokensEnabled()) {
    return badRequest({ code: 'refresh-tokens-disabled' })
  }

  if (redis.enabled) {
    return badRequest({ code: 'not-to-be-used-with-redis'})
  }

  const { refreshToken } = body;

  const session = await getUserAuthSessionByRefreshHash(hash(refreshToken));

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return unauthorized({ code: 'invalid-refresh-token' });
  }

  const user = await getUser(session.userId);

  if (!user) {
    return unauthorized({ code: 'invalid-refresh-token' });
  }

  const { id, username, role, createdAt } = user;

  const token = createSecureToken({ userId: id, role }, secret(), { expiresIn: getAccessExpiry() });

  const newRefreshToken = createRefreshToken();

  await updateUserAuthSession(session.id, {
    refreshHash: hash(newRefreshToken),
    expiresAt: new Date(Date.now() + (getRefreshExpiry() * 24 * 60 * 60 * 1000)),
  });

  const teams = await getAllUserTeams(id);

  return json({
    token,
    refreshToken: newRefreshToken,
    user: {
      id,
      username,
      role,
      createdAt,
      isAdmin: role === ROLES.admin,
      teams,
    },
  });
}