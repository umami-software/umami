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

// next.config.ts rewrites /teams/:teamId/:path* and a relative API_URL onto the API routes, but
// request.url keeps the path the client sent. Undo those rewrites (Next matches them
// case-insensitively) so the check sees the route that handles the request.
function getRewrittenPath(pathname: string) {
  const path = pathname.replace(/^\/teams\/[^/]+(?=\/)/i, '');
  const apiUrl = process.env.API_URL || '';

  if (apiUrl && !/^https?:\/\//i.test(apiUrl)) {
    const prefix = `/${apiUrl.replace(/^\/+|\/+$/g, '')}`.toLowerCase();

    if (prefix !== '/' && prefix !== '/api' && path.toLowerCase().startsWith(`${prefix}/`)) {
      return `/api${path.slice(prefix.length)}`;
    }
  }

  return path;
}

export function isApiKeyBlockedPath(pathname: string) {
  const path = getRewrittenPath(pathname);

  return API_KEY_BLOCKED_PATHS.some(blocked => path === blocked || path.startsWith(`${blocked}/`));
}

export function isApiKeyEnabled() {
  return !process.env.CLOUD_MODE;
}
