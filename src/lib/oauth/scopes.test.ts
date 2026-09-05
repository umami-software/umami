import { describe, expect, test } from 'vitest';
import {
  getContractOAuthScope,
  getRouteOAuthScope,
  hasRequiredScope,
  normalizeScopes,
  OAUTH_ROUTE_SCOPES,
  parseScopes,
} from './scopes';

describe('getRouteOAuthScope', () => {
  test('matches concrete paths against parameterized routes', () => {
    expect(
      getRouteOAuthScope('GET', '/api/websites/6f2a7e0e-2b0f-4b3f-9f0a-1234567890ab/stats'),
    ).toBe('analytics:read');
    expect(getRouteOAuthScope('get', '/api/websites')).toBe('websites:read');
    expect(getRouteOAuthScope('GET', '/api/websites/abc/sessions/def/activity')).toBe(
      'analytics:read',
    );
  });

  test('ignores a base path prefix', () => {
    expect(getRouteOAuthScope('GET', '/umami/api/websites')).toBe('websites:read');
  });

  test('rejects routes that are not allowlisted', () => {
    expect(getRouteOAuthScope('POST', '/api/websites')).toBeNull();
    expect(getRouteOAuthScope('DELETE', '/api/websites/abc')).toBeNull();
    expect(getRouteOAuthScope('GET', '/api/admin/users')).toBeNull();
    expect(getRouteOAuthScope('GET', '/api/me/api-keys')).toBeNull();
    expect(getRouteOAuthScope('POST', '/api/reports')).toBeNull();
  });

  test('does not match partial segments', () => {
    expect(getRouteOAuthScope('GET', '/api/websites/abc/stats/extra')).toBeNull();
    expect(getRouteOAuthScope('GET', '/api/websitesX')).toBeNull();
  });
});

describe('getContractOAuthScope', () => {
  test('looks up contract paths exactly', () => {
    expect(getContractOAuthScope('get', '/api/websites/{websiteId}/stats')).toBe('analytics:read');
    expect(getContractOAuthScope('post', '/api/websites/{websiteId}')).toBeNull();
  });
});

describe('scope helpers', () => {
  test('parses and normalizes scope strings', () => {
    expect(parseScopes(' analytics:read  websites:read ')).toEqual([
      'analytics:read',
      'websites:read',
    ]);
    expect(normalizeScopes(['websites:read', 'bogus', 'analytics:read', 'websites:read'])).toEqual([
      'analytics:read',
      'websites:read',
    ]);
    expect(hasRequiredScope(['analytics:read'], 'websites:read')).toBe(false);
  });

  test('every allowlisted route is unique', () => {
    const keys = OAUTH_ROUTE_SCOPES.map(route => `${route.method} ${route.path}`);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
