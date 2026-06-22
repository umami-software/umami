import debug from 'debug';
import {
  ROLE_PERMISSIONS,
  ROLES,
  SHARE_CONTEXT_HEADER,
  SHARE_TOKEN_HEADER,
  SHARE_TOKEN_TYPE,
} from '@/lib/constants';
import { createAuthKey, secret, hash } from '@/lib/crypto';
import { createSecureToken, getRefreshExpiry, parseSecureToken, parseToken } from '@/lib/jwt';
import redis from '@/lib/redis';
import { ensureArray } from '@/lib/utils';
import { getUser } from '@/queries/prisma/user';
import prisma from './prisma';
import { getUserAuthSessionByRefreshHash, updateUserAuthSession } from '@/queries/prisma';

const log = debug('umami:auth');

export function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization');

  return auth?.split(' ')[1];
}

export async function checkAuth(request: Request) {
  const token = getBearerToken(request);
  const payload = parseSecureToken(token, secret());
  const shareToken = await parseShareToken(request);

  let user = null;
  const { userId, authKey } = payload || {};

  if (userId) {
    user = await getUser(userId);
  } else if (redis.enabled && authKey) {
    const key = await redis.client.get(authKey);

    if (key?.userId) {
      user = await getUser(key.userId);
    }
  }

  log({ token, payload, authKey, shareToken, user });

  if (!user?.id && !shareToken) {
    log('User not authorized');
    return null;
  }

  if (!user?.id && shareToken) {
    const shareContext = request.headers.get(SHARE_CONTEXT_HEADER);
    if (!shareContext) {
      log('Share token used outside share context');
      return null;
    }
  }

  if (user) {
    user.isAdmin = user.role === ROLES.admin;
  }

  return {
    token,
    authKey,
    shareToken,
    user,
  };
}

export async function saveAuth(data: any, expire = 0) {
  const authKey = `auth:${createAuthKey()}`;

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

export function parseShareToken(request: Request) {
  try {
    const token: any = parseToken(request.headers.get(SHARE_TOKEN_HEADER), secret());

    // Only accept tokens explicitly minted as share tokens. This prevents other
    // tokens signed with the same secret (e.g. the cache token from /api/send)
    // from being replayed as share tokens to gain analytics access.
    if (token?.type !== SHARE_TOKEN_TYPE) {
      return null;
    }

    return token;
  } catch (e) {
    log(e);
    return null;
  }
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
  await prisma.client.userAuthSession.create({
    data: {
      userId,
      refreshHash: hash(refreshToken),
      expiresAt: new Date(Date.now() + (getRefreshExpiry() * 24 * 60 * 60 * 1000)),
    },
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  const session = await getUserAuthSessionByRefreshHash(hash(refreshToken));

  if (!session) {
    return;
  }

  await updateUserAuthSession(session.id, { revokedAt: new Date() });
}