import debug from 'debug';
import { CLIENT_METADATA_CACHE_SECONDS } from '@/lib/oauth/config';
import { OAuthError } from '@/lib/oauth/errors';
import { isAcceptableRedirectUri, parseUrl } from '@/lib/oauth/redirect';
import redis from '@/lib/redis';
import { getOauthClient } from '@/queries/prisma/oauth';

const log = debug('umami:oauth');

const METADATA_FETCH_TIMEOUT_MS = 5000;
const METADATA_MAX_BYTES = 64 * 1024;
const MAX_REDIRECT_URIS = 20;

export interface ResolvedOAuthClient {
  clientId: string;
  clientName: string;
  clientUri?: string;
  logoUri?: string;
  redirectUris: string[];
  source: 'metadata-document' | 'registered';
}

interface ClientMetadataDocument {
  client_id?: unknown;
  client_name?: unknown;
  client_uri?: unknown;
  logo_uri?: unknown;
  redirect_uris?: unknown;
  token_endpoint_auth_method?: unknown;
}

const memoryCache = new Map<string, { value: ResolvedOAuthClient; expiresAt: number }>();

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase();

  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    return true;
  }

  // IPv6 literal
  if (host.startsWith('[')) {
    return true;
  }

  // IPv4 literal: block entirely; metadata documents must be served from a DNS name.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return true;
  }

  return false;
}

/**
 * A Client ID Metadata Document identifier is an https URL with a non-root path.
 * (draft-ietf-oauth-client-id-metadata-document)
 */
export function isClientMetadataUrl(clientId: string) {
  const url = parseUrl(clientId);

  return (
    !!url &&
    url.protocol === 'https:' &&
    url.pathname !== '/' &&
    url.pathname.length > 1 &&
    !url.hash &&
    !url.username &&
    !url.password &&
    !isPrivateHostname(url.hostname)
  );
}

function parseRedirectUris(value: unknown) {
  if (!Array.isArray(value) || !value.length || value.length > MAX_REDIRECT_URIS) {
    return null;
  }

  const uris = value.filter((uri): uri is string => typeof uri === 'string');

  if (uris.length !== value.length || !uris.every(isAcceptableRedirectUri)) {
    return null;
  }

  return uris;
}

function asString(value: unknown, max = 255) {
  return typeof value === 'string' && value.length <= max ? value : undefined;
}

export function validateClientMetadata(
  clientId: string,
  document: ClientMetadataDocument,
): ResolvedOAuthClient {
  if (document.client_id !== clientId) {
    throw new OAuthError(
      'invalid_client_metadata',
      'client_id in the metadata document does not match the document URL.',
    );
  }

  const redirectUris = parseRedirectUris(document.redirect_uris);

  if (!redirectUris) {
    throw new OAuthError(
      'invalid_client_metadata',
      'redirect_uris must be a non-empty list of absolute https, loopback or custom-scheme URLs.',
    );
  }

  const clientName = asString(document.client_name);

  if (!clientName) {
    throw new OAuthError('invalid_client_metadata', 'client_name is required.');
  }

  if (
    document.token_endpoint_auth_method !== undefined &&
    document.token_endpoint_auth_method !== 'none'
  ) {
    throw new OAuthError(
      'invalid_client_metadata',
      'Only public clients (token_endpoint_auth_method "none") are supported.',
    );
  }

  return {
    clientId,
    clientName,
    clientUri: asString(document.client_uri, 2048),
    logoUri: asString(document.logo_uri, 2048),
    redirectUris,
    source: 'metadata-document',
  };
}

async function readCache(clientId: string): Promise<ResolvedOAuthClient | null> {
  if (redis.enabled) {
    return (await redis.client.get(`oauth:client:${clientId}`)) ?? null;
  }

  const entry = memoryCache.get(clientId);

  if (entry && entry.expiresAt > Date.now()) {
    return entry.value;
  }

  memoryCache.delete(clientId);

  return null;
}

async function writeCache(clientId: string, value: ResolvedOAuthClient) {
  if (redis.enabled) {
    await redis.client.set(`oauth:client:${clientId}`, value, CLIENT_METADATA_CACHE_SECONDS);
    return;
  }

  memoryCache.set(clientId, {
    value,
    expiresAt: Date.now() + CLIENT_METADATA_CACHE_SECONDS * 1000,
  });
}

export type MetadataFetch = (url: string, init: RequestInit) => Promise<Response>;

export async function fetchClientMetadata(
  clientId: string,
  fetchImpl: MetadataFetch = fetch,
): Promise<ResolvedOAuthClient> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), METADATA_FETCH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(clientId, {
      method: 'GET',
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OAuthError(
        'invalid_client',
        `Could not fetch client metadata document (${response.status}).`,
      );
    }

    const text = await response.text();

    if (text.length > METADATA_MAX_BYTES) {
      throw new OAuthError('invalid_client_metadata', 'Client metadata document is too large.');
    }

    let document: ClientMetadataDocument;

    try {
      document = JSON.parse(text);
    } catch {
      throw new OAuthError('invalid_client_metadata', 'Client metadata document is not JSON.');
    }

    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw new OAuthError('invalid_client_metadata', 'Client metadata document is not an object.');
    }

    return validateClientMetadata(clientId, document);
  } catch (error) {
    if (error instanceof OAuthError) {
      throw error;
    }

    log('client metadata fetch failed', error);

    throw new OAuthError('invalid_client', 'Could not fetch client metadata document.');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolves a client by ID. URL-shaped IDs are Client ID Metadata Documents (fetched and cached);
 * anything else must be a client registered through dynamic registration.
 */
export async function resolveOAuthClient(
  clientId: unknown,
  options: { fetch?: MetadataFetch } = {},
): Promise<ResolvedOAuthClient> {
  if (typeof clientId !== 'string' || !clientId || clientId.length > 2048) {
    throw new OAuthError('invalid_client', 'client_id is required.');
  }

  if (isClientMetadataUrl(clientId)) {
    const cached = await readCache(clientId);

    if (cached) {
      return cached;
    }

    const client = await fetchClientMetadata(clientId, options.fetch);

    await writeCache(clientId, client);

    return client;
  }

  if (clientId.startsWith('http://') || clientId.startsWith('https://')) {
    throw new OAuthError(
      'invalid_client',
      'client_id URLs must use https, include a path and not point at a private host.',
    );
  }

  const registered = await getOauthClient(clientId);

  if (!registered) {
    throw new OAuthError('invalid_client', 'Unknown client_id.');
  }

  const redirectUris = parseRedirectUris(registered.redirectUris);

  if (!redirectUris) {
    throw new OAuthError('invalid_client', 'Registered client has no valid redirect URIs.');
  }

  const metadata = (registered.metadata ?? {}) as Record<string, unknown>;

  return {
    clientId: registered.id,
    clientName: registered.name,
    clientUri: asString(metadata.client_uri, 2048),
    logoUri: asString(metadata.logo_uri, 2048),
    redirectUris,
    source: 'registered',
  };
}

export function clearClientMetadataCache() {
  memoryCache.clear();
}
