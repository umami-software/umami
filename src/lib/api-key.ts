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
  '/api/oauth',
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

export function isApiKeyBlockedPath(pathname: string) {
  return API_KEY_BLOCKED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
}

export function isApiKeyEnabled() {
  return !process.env.CLOUD_MODE;
}
