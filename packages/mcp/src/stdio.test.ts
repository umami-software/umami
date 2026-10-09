import { describe, expect, test } from 'vitest';
import { resolveClientOptions } from './stdio';

describe('resolveClientOptions', () => {
  test('appends /api to a self-hosted instance URL', () => {
    expect(
      resolveClientOptions({ UMAMI_URL: 'https://analytics.example.com/', UMAMI_API_TOKEN: 't' }),
    ).toEqual({ baseUrl: 'https://analytics.example.com/api', token: 't', apiKey: undefined });
  });

  test('uses UMAMI_API_URL verbatim', () => {
    expect(
      resolveClientOptions({ UMAMI_API_URL: 'https://api.umami.is/v1', UMAMI_API_KEY: 'k' }),
    ).toEqual({ baseUrl: 'https://api.umami.is/v1', token: undefined, apiKey: 'k' });
  });

  test('defaults to Cloud when only an API key is provided', () => {
    expect(resolveClientOptions({ UMAMI_API_KEY: 'k' }).baseUrl).toBeUndefined();
  });

  test('requires credentials', () => {
    expect(() => resolveClientOptions({})).toThrow(/UMAMI_API_TOKEN/);
  });
});
