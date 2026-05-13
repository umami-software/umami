import { expect, test } from 'vitest';
import { getApiUrl } from '../api-url';

test('uses the default api path', () => {
  expect(getApiUrl('/websites', { apiUrl: '', basePath: '' })).toBe('/api/websites');
});

test('uses basePath with the default api path', () => {
  expect(getApiUrl('/websites', { apiUrl: '', basePath: '/analytics' })).toBe(
    '/analytics/api/websites',
  );
});

test('routes calls through a relative API_URL', () => {
  expect(getApiUrl('/websites', { apiUrl: '/backend/api', basePath: '' })).toBe(
    '/backend/api/websites',
  );
});

test('routes calls through basePath with a relative API_URL', () => {
  expect(getApiUrl('/websites', { apiUrl: '/backend/api', basePath: '/analytics' })).toBe(
    '/analytics/backend/api/websites',
  );
});

test('routes calls through an absolute API_URL', () => {
  expect(getApiUrl('/websites', { apiUrl: 'https://api.example.com/api', basePath: '' })).toBe(
    'https://api.example.com/api/websites',
  );
});

test('leaves absolute request URLs unchanged', () => {
  expect(getApiUrl('https://example.com/custom', { apiUrl: '/backend/api', basePath: '' })).toBe(
    'https://example.com/custom',
  );
});

test('keeps /auth/* on the default api path', () => {
  expect(
    getApiUrl('/auth/login', { apiUrl: 'https://api.example.com/api', basePath: '' }),
  ).toBe('/api/auth/login');
});

test('keeps /config on the default api path', () => {
  expect(getApiUrl('/config', { apiUrl: 'https://api.example.com/api', basePath: '' })).toBe(
    '/api/config',
  );
});

test('keeps /auth/* on the default api path with basePath', () => {
  expect(
    getApiUrl('/auth/verify', {
      apiUrl: 'https://api.example.com/api',
      basePath: '/analytics',
    }),
  ).toBe('/analytics/api/auth/verify');
});
