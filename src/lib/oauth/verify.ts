import debug from 'debug';
import { ROLES } from '@/lib/constants';
import { hash } from '@/lib/crypto';
import { isOAuthEnabled } from '@/lib/oauth/config';
import { getRouteOAuthScope, hasRequiredScope } from '@/lib/oauth/scopes';
import {
  looksLikeAccessToken,
  type VerifiedAccessToken,
  verifyAccessToken,
} from '@/lib/oauth/tokens';
import type { Auth } from '@/lib/types';
import { getUser } from '@/queries/prisma/user';

const log = debug('umami:oauth');

export type OAuthAuthResult =
  | { status: 'not-oauth' }
  | { status: 'invalid' }
  | {
      status: 'forbidden';
      reason: 'route-not-allowed' | 'insufficient-scope';
      requiredScope?: string;
    }
  | { status: 'ok'; auth: Auth & { token: string } };

/**
 * Resolves an OAuth access token into an ordinary Umami `Auth` context.
 *
 * OAuth tokens are only accepted on routes listed in `OAUTH_ROUTE_SCOPES` and only when the
 * token carries the scope that route requires. The resulting user context is subject to all
 * normal Umami permission checks; scopes never widen access.
 */
export async function verifyOAuthRequest(
  token: string | undefined,
  method: string,
  pathname: string,
): Promise<OAuthAuthResult> {
  if (!looksLikeAccessToken(token)) {
    return { status: 'not-oauth' };
  }

  if (!isOAuthEnabled()) {
    return { status: 'invalid' };
  }

  const verified = verifyAccessToken(token);

  if (!verified) {
    log('invalid OAuth access token');
    return { status: 'invalid' };
  }

  const requiredScope = getRouteOAuthScope(method, pathname);

  if (!requiredScope) {
    log('OAuth token used on non-allowlisted route', method, pathname);
    return { status: 'forbidden', reason: 'route-not-allowed' };
  }

  if (!hasRequiredScope(verified.scopes, requiredScope)) {
    return { status: 'forbidden', reason: 'insufficient-scope', requiredScope };
  }

  const auth = await buildOAuthAuth(token, verified);

  return auth ? { status: 'ok', auth } : { status: 'invalid' };
}

export async function buildOAuthAuth(token: string, verified: VerifiedAccessToken) {
  const user: any = await getUser(verified.userId, { includePassword: true });

  if (!user?.id || user.deletedAt) {
    log('OAuth token user not found');
    return null;
  }

  if (verified.passwordFingerprint && hash(user.password) !== verified.passwordFingerprint) {
    log('OAuth token issued before password change');
    return null;
  }

  delete user.password;
  user.isAdmin = user.role === ROLES.admin;

  return {
    token,
    user,
    authType: 'oauth' as const,
    oauth: {
      clientId: verified.clientId,
      scopes: verified.scopes,
      tokenId: verified.tokenId,
    },
  };
}
