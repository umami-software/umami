import { createHash, randomBytes } from 'crypto';
import { getSetting } from '@/queries/prisma/setting';

export type OIDCConfig = {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  usernameClaim: string;
  autoCreateUsers: boolean;
  enabled: boolean;
};

type WellKnown = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  end_session_endpoint?: string;
};

const wellKnownCache: { [issuer: string]: WellKnown } = {};

export function getOIDCConfig(): OIDCConfig {
  const issuerUrl = process.env.OIDC_ISSUER_URL || '';
  const clientId = process.env.OIDC_CLIENT_ID || '';
  const clientSecret = process.env.OIDC_CLIENT_SECRET || '';
  const redirectUri = process.env.OIDC_REDIRECT_URI || '';
  const scopes = process.env.OIDC_SCOPES || 'openid profile email';
  const usernameClaim = process.env.OIDC_USERNAME_CLAIM || 'preferred_username';
  const autoCreateUsers = (process.env.OIDC_AUTO_CREATE_USERS || 'true').toLowerCase() === 'true';

  const enabled = Boolean(issuerUrl && clientId && redirectUri);

  return {
    issuerUrl,
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    usernameClaim,
    autoCreateUsers,
    enabled,
  };
}

export async function getEffectiveOIDCConfig(): Promise<OIDCConfig> {
  const envCfg = getOIDCConfig();
  const [issuerUrl, clientId, clientSecret, redirectUri, scopes, usernameClaim, autoCreateUsers] =
    await Promise.all([
      getSetting('oidc:issuerUrl'),
      getSetting('oidc:clientId'),
      getSetting('oidc:clientSecret'),
      getSetting('oidc:redirectUri'),
      getSetting('oidc:scopes'),
      getSetting('oidc:usernameClaim'),
      getSetting('oidc:autoCreateUsers'),
    ]);

  const cfg: OIDCConfig = {
    issuerUrl: (issuerUrl || envCfg.issuerUrl)?.replace(/\/$/, ''),
    clientId: clientId || envCfg.clientId,
    clientSecret: clientSecret || envCfg.clientSecret,
    redirectUri: redirectUri || envCfg.redirectUri,
    scopes: scopes || envCfg.scopes,
    usernameClaim: usernameClaim || envCfg.usernameClaim,
    autoCreateUsers: (autoCreateUsers || String(envCfg.autoCreateUsers)).toLowerCase() === 'true',
    enabled: true,
  };

  cfg.enabled = Boolean(cfg.issuerUrl && cfg.clientId && cfg.redirectUri);
  return cfg;
}

async function fetchWellKnown(issuerOrWellKnown: string): Promise<WellKnown> {
  const base = issuerOrWellKnown.replace(/\/$/, '');
  const wellKnownUrl = base.includes('/.well-known/openid-configuration')
    ? base
    : `${base}/.well-known/openid-configuration`;

  if (wellKnownCache[wellKnownUrl]) return wellKnownCache[wellKnownUrl];

  const res = await fetch(wellKnownUrl, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Failed to load OIDC discovery document: ${res.status}`);
  }
  const data = (await res.json()) as WellKnown;
  wellKnownCache[wellKnownUrl] = data;
  return data;
}

function base64url(input: Buffer) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function generateState(): Promise<string> {
  return base64url(randomBytes(16));
}

export async function generateCodeVerifier(): Promise<string> {
  return base64url(randomBytes(32));
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

export async function getAuthorizationUrl(cfg: OIDCConfig, state: string, codeChallenge: string) {
  const wk = await fetchWellKnown(cfg.issuerUrl);
  const url = new URL(wk.authorization_endpoint);
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('redirect_uri', cfg.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', cfg.scopes);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export type TokenSetLite = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

export async function exchangeCodeForToken(
  cfg: OIDCConfig,
  code: string,
  codeVerifier: string,
): Promise<TokenSetLite> {
  const wk = await fetchWellKnown(cfg.issuerUrl);

  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('redirect_uri', cfg.redirectUri);
  body.set('client_id', cfg.clientId);
  body.set('code_verifier', codeVerifier);

  const headers: Record<string, string> = { 'content-type': 'application/x-www-form-urlencoded' };

  if (cfg.clientSecret) {
    const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
    headers['authorization'] = `Basic ${basic}`;
  }

  const res = await fetch(wk.token_endpoint, { method: 'POST', headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as TokenSetLite;
}

export function decodeJwtClaims(idToken: string): any {
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  const payload = parts[1];
  const buf = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    return null;
  }
}

export function getOIDCUsernameFromIdToken(idToken: string, usernameClaim: string): string | null {
  const claims = decodeJwtClaims(idToken) || {};
  const val = claims?.[usernameClaim] || claims?.email || claims?.sub;
  return typeof val === 'string' ? val : null;
}
