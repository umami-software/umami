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
