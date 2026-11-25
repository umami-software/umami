import { hash } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';

export const API_KEY_PREFIX = 'umami_';
export const API_KEY_LENGTH = 32;
export const API_KEY_DISPLAY_LENGTH = API_KEY_PREFIX.length + 8;
export const API_KEY_LAST_USED_INTERVAL = 5 * 60 * 1000;

// Routes that manage account credentials or admin state must not be
// reachable with an API key. Matched as path prefixes.
export const API_KEY_BLOCKED_PATHS = [
  '/api/me/password',
  '/api/me/api-keys',
  '/api/2fa',
  '/api/auth',
  '/api/users',
  '/api/admin',
];

export function generateApiKey() {
  return `${API_KEY_PREFIX}${getRandomChars(API_KEY_LENGTH)}`;
}

export function hashApiKey(key: string) {
  return hash(key);
}

export function getApiKeyPrefix(key: string) {
  return key.slice(0, API_KEY_DISPLAY_LENGTH);
}

export function isApiKey(token?: string | null): token is string {
  return typeof token === 'string' && token.startsWith(API_KEY_PREFIX);
}

// request.url keeps the path the client sent, which can differ from the route that handles it:
// it may be percent-encoded, contain repeated slashes or differ in case, and still match.
// Normalize it (returns null for malformed encoding).
function normalizePath(pathname: string) {
  try {
    return decodeURIComponent(pathname)
      .replace(/[\\/]+/g, '/')
      .toLowerCase();
  } catch {
    return null;
  }
}

function toPrefix(value: string) {
  return `/${value.replace(/^\/+|\/+$/g, '')}`.toLowerCase();
}

// next.config.ts applies BASE_PATH and rewrites /teams/:teamId/:path* and a relative API_URL
// onto the API routes. Undo those so the check sees the route that handles the request.
function getRewrittenPath(pathname: string) {
  const basePath = toPrefix(process.env.basePath || '');
  let path = pathname;

  if (basePath !== '/' && path.startsWith(`${basePath}/`)) {
    path = path.slice(basePath.length);
  }

  path = path.replace(/^\/teams\/[^/]+(?=\/)/, '');

  const apiUrl = process.env.API_URL || '';

  if (apiUrl && !/^https?:\/\//i.test(apiUrl)) {
    const prefix = toPrefix(apiUrl);

    if (prefix !== '/' && prefix !== '/api' && path.startsWith(`${prefix}/`)) {
      return `/api${path.slice(prefix.length)}`;
    }
  }

  return path;
}

export function isApiKeyBlockedPath(pathname: string) {
  const normalized = normalizePath(pathname);

  if (normalized === null) {
    return true;
  }

  const path = getRewrittenPath(normalized);

  return API_KEY_BLOCKED_PATHS.some(blocked => path === blocked || path.startsWith(`${blocked}/`));
}

export function isApiKeyEnabled() {
  return !process.env.CLOUD_MODE;
}
