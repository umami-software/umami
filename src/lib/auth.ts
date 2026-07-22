import debug from 'debug';
import { auth as betterAuth } from '@/lib/auth-server';
import {
  ROLE_PERMISSIONS,
  ROLES,
  SHARE_CONTEXT_HEADER,
  SHARE_TOKEN_HEADER,
  SHARE_TOKEN_TYPE,
} from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { parseToken } from '@/lib/jwt';
import { ensureArray } from '@/lib/utils';
import { getUser } from '@/queries/prisma/user';

const log = debug('umami:auth');

export async function checkAuth(request: Request) {
  const session = await betterAuth.api
    .getSession({ headers: request.headers })
    .catch((e: unknown) => {
      log(e);
      return null;
    });
  const shareToken = await parseShareToken(request);

  let user = null;

  if (session?.user?.id) {
    // Re-read through umami's own query to enforce soft-delete filtering and
    // keep the exact user shape the API routes and permissions expect.
    user = await getUser(session.user.id);
  }

  log({
    hasSession: !!session,
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
    user.isAdmin = user.role === ROLES.admin;
  }

  return {
    token: session?.session?.token,
    shareToken,
    user,
  };
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
