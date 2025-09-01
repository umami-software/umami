import bcrypt from 'bcryptjs';
import debug from 'debug';
import { ROLE_PERMISSIONS, ROLES, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';
import { createSecureToken, parseSecureToken, parseToken } from '@/lib/jwt';
import { ensureArray } from '@/lib/utils';
import redis from '@/lib/redis';
import { getUser } from '@/queries/prisma/user';

const log = debug('umami:auth');
const SALT_ROUNDS = 10;

export function hashPassword(password: string, rounds = SALT_ROUNDS) {
  return bcrypt.hashSync(password, rounds);
}

export function checkPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

export async function checkAuth(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')?.[1];
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(request.headers);

  let user = null;
  const { userId, authKey, grant } = payload || {};

  if (userId) {
    user = await getUser(userId);
  } else if (redis.enabled && authKey) {
    const key = await redis.client.get(authKey);

    if (key?.userId) {
      user = await getUser(key.userId);
    }
  }

  log({ token, shareToken, payload, user, grant });

  if (!user?.id && !shareToken) {
    log('User not authorized');
    return null;
  }

  if (user) {
    user.isAdmin = user.role === ROLES.admin;
  }

  return {
    user,
    grant,
    token,
    shareToken,
    authKey,
  };
}

export async function saveAuth(data: any, expire = 0) {
  const authKey = `auth:${getRandomChars(32)}`;

  if (redis.enabled) {
    await redis.client.set(authKey, data);

    if (expire) {
      await redis.client.expire(authKey, expire);
    }
  }

  return createSecureToken({ authKey }, secret());
}

export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some(e => ROLE_PERMISSIONS[role]?.includes(e));
}

export function parseShareToken(headers: Headers) {
  try {
    return parseToken(headers.get(SHARE_TOKEN_HEADER), secret());
  } catch (e) {
    log(e);
    return null;
  }
}
