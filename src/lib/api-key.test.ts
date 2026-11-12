import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  API_KEY_PREFIX,
  generateApiKey,
  getApiKeyPrefix,
  hashApiKey,
  isApiKey,
  isApiKeyBlockedPath,
  isApiKeyEnabled,
} from './api-key';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('generateApiKey', () => {
  test('produces umami_ followed by 32 base62 characters', () => {
    const key = generateApiKey();

    expect(key).toMatch(/^umami_[0-9a-zA-Z]{32}$/);
  });

  test('produces unique keys', () => {
    expect(generateApiKey()).not.toBe(generateApiKey());
  });
});

describe('hashApiKey', () => {
  test('is deterministic and does not equal the key', () => {
    const key = generateApiKey();

    expect(hashApiKey(key)).toBe(hashApiKey(key));
    expect(hashApiKey(key)).not.toBe(key);
    expect(hashApiKey(key)).toHaveLength(128);
  });
});

describe('getApiKeyPrefix', () => {
  test('returns the prefix plus the first 8 characters', () => {
    const key = `${API_KEY_PREFIX}abcdefghijklmnopqrstuvwxyz012345`;

    expect(getApiKeyPrefix(key)).toBe('umami_abcdefgh');
  });
});

describe('isApiKey', () => {
  test('detects api keys by prefix', () => {
    expect(isApiKey('umami_abc')).toBe(true);
    expect(isApiKey('eyJhbGciOi')).toBe(false);
    expect(isApiKey(undefined)).toBe(false);
    expect(isApiKey(null)).toBe(false);
  });
});

describe('isApiKeyBlockedPath', () => {
  test('blocks credential and admin routes', () => {
    expect(isApiKeyBlockedPath('/api/me/password')).toBe(true);
    expect(isApiKeyBlockedPath('/api/me/api-keys')).toBe(true);
    expect(isApiKeyBlockedPath('/api/me/api-keys/abc')).toBe(true);
    expect(isApiKeyBlockedPath('/api/2fa/status')).toBe(true);
    expect(isApiKeyBlockedPath('/api/auth/logout')).toBe(true);
    expect(isApiKeyBlockedPath('/api/users')).toBe(true);
    expect(isApiKeyBlockedPath('/api/users/abc/websites')).toBe(true);
    expect(isApiKeyBlockedPath('/api/admin/users')).toBe(true);
  });

  test('allows data routes', () => {
    expect(isApiKeyBlockedPath('/api/me')).toBe(false);
    expect(isApiKeyBlockedPath('/api/me/websites')).toBe(false);
    expect(isApiKeyBlockedPath('/api/me/teams')).toBe(false);
    expect(isApiKeyBlockedPath('/api/websites')).toBe(false);
    expect(isApiKeyBlockedPath('/api/websites/abc/stats')).toBe(false);
    expect(isApiKeyBlockedPath('/api/authors')).toBe(false);
  });

  // Rewrites route these paths to the blocked handlers while request.url keeps the original
  // path, so a leaked key could otherwise mint new keys or manage users through them.
  test('blocks credential and admin routes reached through the team rewrite', () => {
    expect(isApiKeyBlockedPath('/teams/abc/api/me/api-keys')).toBe(true);
    expect(isApiKeyBlockedPath('/TEAMS/abc/api/users/abc')).toBe(true);
    expect(isApiKeyBlockedPath('/Teams/abc/api/admin/users')).toBe(true);
    expect(isApiKeyBlockedPath('/teams/abc/api/me')).toBe(false);
    expect(isApiKeyBlockedPath('/teams/abc/api/websites/abc/stats')).toBe(false);
  });

  test('blocks credential and admin routes reached through a relative API_URL', () => {
    vi.stubEnv('API_URL', '/umami-api/');

    expect(isApiKeyBlockedPath('/umami-api/me/api-keys')).toBe(true);
    expect(isApiKeyBlockedPath('/Umami-API/users/abc')).toBe(true);
    expect(isApiKeyBlockedPath('/teams/abc/umami-api/2fa/status')).toBe(true);
    expect(isApiKeyBlockedPath('/umami-api/me')).toBe(false);
    expect(isApiKeyBlockedPath('/umami-apiusers')).toBe(false);
  });

  test('ignores an absolute API_URL, which is not rewritten', () => {
    vi.stubEnv('API_URL', 'https://api.example.com');

    expect(isApiKeyBlockedPath('/api/me/api-keys')).toBe(true);
    expect(isApiKeyBlockedPath('/api/me')).toBe(false);
  });
});

describe('isApiKeyEnabled', () => {
  test('is disabled in cloud mode', () => {
    vi.stubEnv('CLOUD_MODE', '1');

    expect(isApiKeyEnabled()).toBe(false);
  });

  test('is enabled when CLOUD_MODE is unset', () => {
    vi.stubEnv('CLOUD_MODE', '');

    expect(isApiKeyEnabled()).toBe(true);
  });
});
