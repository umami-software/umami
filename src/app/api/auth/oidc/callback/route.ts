import { NextRequest } from 'next/server';
import {
  getEffectiveOIDCConfig,
  getOIDCUsernameFromIdToken,
  exchangeCodeForToken,
} from '@/lib/oidc';
import { badRequest, unauthorized } from '@/lib/response';
import { saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { getUserByUsername, createUser } from '@/queries';
import { uuid, secret } from '@/lib/crypto';
import { createSecureToken } from '@/lib/jwt';
import redis from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const cfg = await getEffectiveOIDCConfig();

  if (!cfg.enabled) {
    return badRequest('OIDC is not enabled');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return badRequest('Missing code or state parameter');
  }

  // Décoder les données du state
  let stateData;
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    stateData = JSON.parse(decoded);
  } catch (e) {
    return badRequest('Invalid state parameter format');
  }

  const { codeVerifier, returnUrl } = stateData;
  const returnCookie = returnUrl || '/dashboard';

  const tokens = await exchangeCodeForToken(cfg, code, codeVerifier);
  const idToken = tokens.id_token;

  if (!idToken) {
    return unauthorized('Missing id_token');
  }

  const username = getOIDCUsernameFromIdToken(idToken, cfg.usernameClaim);

  if (!username) {
    return unauthorized('Unable to resolve username from id_token');
  }

  let user = await getUserByUsername(username);

  if (!user && cfg.autoCreateUsers) {
    user = await createUser({ id: uuid(), username, password: uuid(), role: ROLES.user });
  }

  if (!user) {
    return unauthorized('User not allowed');
  }

  let token: string;
  if (redis.enabled) {
    token = await saveAuth({ userId: user.id, role: user.role });
  } else {
    token = createSecureToken({ userId: user.id, role: user.role }, secret());
  }

  const baseUrl = new URL(request.url).origin;
  const ssoUrl = `${baseUrl}/sso?url=${encodeURIComponent(returnCookie)}&token=${encodeURIComponent(
    token,
  )}`;
  return Response.redirect(ssoUrl, 302);
}
