import { NextRequest } from 'next/server';
import {
  getEffectiveOIDCConfig,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  getAuthorizationUrl,
} from '@/lib/oidc';
import { json, badRequest } from '@/lib/response';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const cfg = await getEffectiveOIDCConfig();

  if (!cfg.enabled) {
    return badRequest('OIDC is not enabled');
  }

  const url = new URL(request.url);
  const returnUrl = url.searchParams.get('returnUrl') || '/dashboard';

  const state = await generateState();
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl = await getAuthorizationUrl(cfg, state, codeChallenge);

  const stateData = Buffer.from(
    JSON.stringify({
      state,
      codeVerifier,
      returnUrl,
    }),
  ).toString('base64url');

  const finalAuthUrl = authUrl.replace(`state=${state}`, `state=${stateData}`);

  return json({ url: finalAuthUrl });
}
