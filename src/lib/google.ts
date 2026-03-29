import { format } from 'date-fns';
import { GOOGLE_DOMAIN_TO_COUNTRY, GoogleDomain } from '@/lib/constants';
import { decrypt, secret } from '@/lib/crypto';
import { getWebsiteGoogleAuth, updateWebsiteGoogleAuthTokens } from '@/queries/prisma/googleAuth';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_SITES_URL = 'https://www.googleapis.com/webmasters/v3/sites';
const GOOGLE_SEARCH_ANALYTICS_URL =
  'https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly email';

export interface GscProperty {
  siteUrl: string;
}

export interface SearchTermRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchTermsResult {
  rows: Array<SearchTermRow>;
  total: number;
}

export interface SearchTermsParams {
  startAt: number;
  endAt: number;
  path?: string;
  googleDomain?: GoogleDomain;
  limit?: number;
  offset?: number;
}

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID is not configured');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error('GOOGLE_CLIENT_SECRET is not configured');
  return secret;
}

export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GSC_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  email: string;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  const accessToken: string = data.access_token;
  const refreshToken: string = data.refresh_token;
  const expiresIn: number = data.expires_in ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Fetch user email
  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userData = await userRes.json();
  const email: string = userData.email ?? '';

  return { accessToken, refreshToken, expiresAt, email };
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  const accessToken: string = data.access_token;
  const expiresIn: number = data.expires_in ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return { accessToken, expiresAt };
}

export async function getGscProperties(accessToken: string): Promise<Array<GscProperty>> {
  const res = await fetch(GOOGLE_SITES_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch GSC properties: ${res.status}`);
  }

  const data = await res.json();
  return (data.siteEntry ?? []) as Array<GscProperty>;
}

/** Get a valid access token for the website, auto-refreshing if needed. */
export async function getValidAccessToken(websiteId: string): Promise<string> {
  const auth = await getWebsiteGoogleAuth(websiteId);

  if (!auth) {
    throw new Error('Google Search Console not connected for this website');
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (auth.expiresAt > fiveMinutesFromNow) {
    return decrypt(auth.accessToken, secret());
  }

  const refreshToken = decrypt(auth.refreshToken, secret());
  const { accessToken: newAccessToken, expiresAt } = await refreshAccessToken(refreshToken);

  await updateWebsiteGoogleAuthTokens(websiteId, newAccessToken, expiresAt);

  return newAccessToken;
}

export async function getSearchTerms(
  accessToken: string,
  siteUrl: string,
  params: SearchTermsParams,
): Promise<SearchTermsResult> {
  const { startAt, endAt, path, googleDomain, limit = 10, offset = 0 } = params;

  const startDate = format(new Date(startAt), 'yyyy-MM-dd');
  const endDate = format(new Date(endAt), 'yyyy-MM-dd');

  const filters: Array<{ dimension: string; operator: string; expression: string }> = [];

  if (path) {
    filters.push({ dimension: 'page', operator: 'contains', expression: path });
  }

  if (googleDomain && googleDomain !== 'google.com') {
    const countryCode = GOOGLE_DOMAIN_TO_COUNTRY[googleDomain];
    if (countryCode) {
      filters.push({ dimension: 'country', operator: 'equals', expression: countryCode });
    }
  }

  const body: Record<string, any> = {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: limit,
    startRow: offset,
  };

  if (filters.length > 0) {
    body.dimensionFilterGroups = [{ filters }];
  }

  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = GOOGLE_SEARCH_ANALYTICS_URL.replace('{siteUrl}', encodedSiteUrl);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`GSC search analytics query failed: ${res.status}`);
  }

  const data = await res.json();
  const rows: SearchTermRow[] = (data.rows ?? []).map((row: any) => ({
    query: row.keys?.[0] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  return { rows, total: rows.length };
}
