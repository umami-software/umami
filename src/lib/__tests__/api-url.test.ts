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

test('uses a relative API_URL', () => {
  expect(getApiUrl('/websites', { apiUrl: '/backend/api', basePath: '' })).toBe(
    '/backend/api/websites',
  );
});

test('uses basePath with a relative API_URL', () => {
  expect(getApiUrl('/websites', { apiUrl: '/backend/api', basePath: '/analytics' })).toBe(
    '/analytics/backend/api/websites',
  );
});

test('uses an absolute API_URL directly', () => {
  expect(getApiUrl('/websites', { apiUrl: 'https://api.example.com/api', basePath: '' })).toBe(
    'https://api.example.com/api/websites',
  );
});

test('leaves absolute request URLs unchanged', () => {
  expect(getApiUrl('https://example.com/custom', { apiUrl: '/backend/api', basePath: '' })).toBe(
    'https://example.com/custom',
  );
});
