import { afterEach, describe, expect, test, vi } from 'vitest';
import { getConfig, getLinksUrls } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getLinksUrls', () => {
  test('returns no urls when LINKS_URL is unset or empty', () => {
    expect(getLinksUrls(undefined)).toEqual([]);
    expect(getLinksUrls('')).toEqual([]);
  });

  test('keeps a single url as is', () => {
    expect(getLinksUrls('https://example.com/q')).toEqual(['https://example.com/q']);
  });

  test('splits a comma-separated list, trimming spaces and empty entries', () => {
    expect(getLinksUrls(' https://example.com , https://go.example.org/q,,')).toEqual([
      'https://example.com',
      'https://go.example.org/q',
    ]);
  });
});

describe('getConfig links urls', () => {
  test('exposes a single LINKS_URL unchanged', () => {
    vi.stubEnv('LINKS_URL', 'https://example.com/q');

    expect(getConfig()).toMatchObject({
      linksUrl: 'https://example.com/q',
      linksUrls: ['https://example.com/q'],
    });
  });

  test('uses the first of several LINKS_URL entries as linksUrl', () => {
    vi.stubEnv('LINKS_URL', 'https://example.com,https://go.example.org');

    expect(getConfig()).toMatchObject({
      linksUrl: 'https://example.com',
      linksUrls: ['https://example.com', 'https://go.example.org'],
    });
  });

  test('leaves linksUrl unset without LINKS_URL so the client falls back to /q', () => {
    vi.stubEnv('LINKS_URL', '');

    const config = getConfig();

    expect(config.linksUrl).toBeUndefined();
    expect(config.linksUrls).toEqual([]);
  });
});
