import debug from 'debug';
import {
  API_KEY_LAST_USED_INTERVAL,
  hashApiKey,
  isApiKey,
  isApiKeyBlockedPath,
  isApiKeyEnabled,
} from '@/lib/api-key';
import {
  AUTH_SESSION_TTL,
  PARTIAL_AUTH_TOKEN_TYPE,
  ROLE_PERMISSIONS,
  ROLES,
  SHARE_CONTEXT_HEADER,
  SHARE_TOKEN_HEADER,
  SHARE_TOKEN_TYPE,
} from '@/lib/constants';
import { createAuthKey, hash, secret } from '@/lib/crypto';
import { createSecureToken, getRefreshExpiry, parseSecureToken, parseToken } from '@/lib/jwt';
import redis from '@/lib/redis';
import { ensureArray } from '@/lib/utils';
import { getApiKeyByHash, updateApiKeyLastUsed } from '@/queries/prisma/apiKey';
import { getShare } from '@/queries/prisma/share';
import { getUser } from '@/queries/prisma/user';
import prisma from './prisma';
import { getUserAuthSessionByRefreshHash, updateUserAuthSession } from '@/queries/prisma';

const log = debug('umami:auth');

export function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization');

  return auth?.split(' ')[1];
}

export async function checkApiKeyAuth(request: Request, token: string) {
  const { pathname } = new URL(request.url);

  if (isApiKeyBlockedPath(pathname)) {
    log('API key not allowed for path', pathname);
    return null;
  }

  const apiKey = await getApiKeyByHash(hashApiKey(token));

  if (!apiKey) {
    log('API key not found');
    return null;
  }

  const user: any = await getUser(apiKey.userId);

  if (!user?.id) {
    log('API key user not found');
    return null;
  }

  const lastUsedAt = apiKey.lastUsedAt?.getTime() ?? 0;

  if (Date.now() - lastUsedAt > API_KEY_LAST_USED_INTERVAL) {
    updateApiKeyLastUsed(apiKey.id).catch(e => log(e));
  }

  delete user.password;
  user.isAdmin = user.role === ROLES.admin;

  return {
    token,
    user,
    authType: 'api-key' as const,
    apiKey: { id: apiKey.id, name: apiKey.name },
  };
}

export async function checkAuth(request: Request) {
  const token = getBearerToken(request);

  if (isApiKeyEnabled() && isApiKey(token)) {
    return checkApiKeyAuth(request, token);
  }

  const payload = parseSecureToken(token, secret());

  // The partial token issued after the password step of a 2FA login only proves
  // knowledge of the password. It must never be accepted as a session; it is
  // only valid for completing the challenge at /api/2fa/verify.
  if (payload?.type === PARTIAL_AUTH_TOKEN_TYPE) {
    log('Partial auth token rejected');
    return null;
  }

  const shareToken = await parseShareToken(request);

  let user = null;
  const { userId, authKey } = payload || {};

  if (userId) {
    user = await getUser(userId, { includePassword: true });

    // Reject tokens issued before the current password.
    // Allow legacy stateless tokens that were minted without a password fingerprint.
    if (user && payload.pwd && hash(user.password) !== payload.pwd) {
      user = null;
    }
  } else if (redis.enabled && authKey) {
    const key = await redis.client.get(authKey);

    if (key?.userId) {
      user = await getUser(key.userId, { includePassword: true });

      // Only enforce password-change invalidation for sessions that include a password fingerprint.
      if (user && key.pwd && hash(user.password) !== key.pwd) {
        user = null;
      }

      // Keep an in-use session alive rather than expiring it a fixed time after
      // login, reusing the window it was created with. Sessions stored before
      // this was recorded are left alone: their intended lifetime is unknown,
      // and defaulting would extend the shorter ones past it.
      if (user && key.ttl) {
        await redis.client.expire(authKey, key.ttl).catch(e => log(e));
      }
    }
  }

  log({
    hasToken: !!token,
    hasPayload: !!payload,
    hasAuthKey: !!authKey,
    hasShareToken: !!shareToken,
    userId: user?.id,
  });

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
    delete user.password;
    user.isAdmin = user.role === ROLES.admin;
  }

  return {
    token,
    authKey,
    shareToken,
    user,
    authType: user ? ('session' as const) : ('share' as const),
  };
}

export async function saveAuth(data: any, expire = AUTH_SESSION_TTL) {
  const authKey = `auth:${createAuthKey()}`;

  if (redis.enabled) {
    // The TTL must be passed to set(): the client falls back to its own short
    // DEFAULT_TTL when called without one, which would expire the session.
    // It is stored alongside the session so refreshes can reuse the same window.
    await redis.client.set(authKey, { ...data, ttl: expire }, expire);
  }

  return createSecureToken({ authKey }, secret());
}

export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some(e => ROLE_PERMISSIONS[role]?.includes(e));
}

export async function parseShareToken(request: Request) {
  try {
    const token: any = parseToken(request.headers.get(SHARE_TOKEN_HEADER), secret());

    // Only accept tokens explicitly minted as share tokens. This prevents other
    // tokens signed with the same secret (e.g. the cache token from /api/send)
    // from being replayed as share tokens to gain analytics access.
    if (token?.type !== SHARE_TOKEN_TYPE) {
      return null;
    }

    // Share tokens are stateless and never expire, so the share they were minted
    // from is re-checked on every request. Deleting a share revokes its tokens.
    if (!token.shareId) {
      return null;
    }

    const share = await getShare(token.shareId);
    const entityId = token.boardId ?? token.websiteId;

    if (!share || share.shareType !== token.shareType || share.entityId !== entityId) {
      log('Share token rejected: share not found');
      return null;
    }

    // Use the current parameters rather than the ones captured at mint time, so
    // turning a section off takes effect for tokens that are already issued.
    return { ...token, parameters: share.parameters };
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
