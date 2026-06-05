import { describe, expect, test } from 'vitest';
import { getApiUrl } from './api-url';

describe('getApiUrl', () => {
  test('calls an absolute API_URL directly', () => {
    expect(
      getApiUrl('/websites', {
        apiUrl: 'https://gateway-eu.umami.dev/api',
        basePath: '/analytics',
      }),
    ).toBe('https://gateway-eu.umami.dev/api/websites');
  });

  test('keeps app routes on the local api path when API_URL is absolute', () => {
    expect(
      getApiUrl('/auth/verify', {
        apiUrl: 'https://gateway-eu.umami.dev/api',
        basePath: '/analytics',
      }),
    ).toBe('/analytics/api/auth/verify');
  });

  test('uses a relative API_URL under the base path', () => {
    expect(
      getApiUrl('/websites', {
        apiUrl: '/internal-api',
        basePath: '/analytics',
      }),
    ).toBe('/analytics/internal-api/websites');
  });

  test('keeps app routes on the local api path', () => {
    expect(
      getApiUrl('/auth/verify', {
        apiUrl: '/internal-api',
        basePath: '/analytics',
      }),
    ).toBe('/analytics/api/auth/verify');
  });

  test('keeps config routes on the local api path', () => {
    expect(
      getApiUrl('/config', {
        apiUrl: '/internal-api',
        basePath: '/analytics',
      }),
    ).toBe('/analytics/api/config');
  });

  test('returns absolute input urls unchanged', () => {
    expect(getApiUrl('https://example.com/api/websites')).toBe('https://example.com/api/websites');
  });
});
